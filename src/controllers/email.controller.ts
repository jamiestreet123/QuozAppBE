import { NextFunction, Request, Response } from 'express';
import {checkPasswordResetTokenValid, deletePasswordResetToken, findUserByEmail, getUserById, passwordResetCreateToken, resetUserPassword} from '../services/user.services';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { getBaseUrl, schema } from '../utils/helpers';

const resetPasswordEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const { user_email } = query;

        const user = await findUserByEmail(user_email as string);

        if (user) {

            const resetToken = randomBytes(32).toString('hex');
            const hash = await bcrypt.hash(resetToken, 12);
            const tokenExpiry  = Date.now() + 10 * 60 * 1000;

            await passwordResetCreateToken(user.id, hash, tokenExpiry);

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: "",
                  pass: ""
                },
              });

              const href = `${getBaseUrl()}/login/password-reset?token=${resetToken}&user_id=${user.id}`;
            
              const mailOptions = {
                from: "",
                to: "",
                subject: "Quiz App: Password Reset",
                html: `<p>Hi ${user.username}</p>
                        <br>
                        <p>This is an email to reset your password.</p>
                        <br>
                        <p>If you requested this, please follow the link here: </p>
                        <br>
                        <a href="${href}">Reset password</a>
                        <br>
                        <p>If you did not request this, please ignore this email.</p>
                        `,
              };
            
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email: ", error);
                } else {
                  console.log("Email sent: ", info.response);
                }
              });
              res.status(200).json("Success");
        } else {
          const error = new Error('Could find user.')
          res.status(404).json({ error: error.message });
          throw error;
        }

    } catch (e) {
        next(e);
    };
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
      const { body } = req;
      const { user_id, token, new_password } = body;
      const resetToken = await checkPasswordResetTokenValid(user_id);

      if (resetToken) {

        const isValid = await bcrypt.compare(token, resetToken.token);

        if (isValid) {
        
          await resetUserPassword(user_id, new_password);

          await deletePasswordResetToken(resetToken.id);
          
          res.status(200).json("Success");
        } else {

          const error = new Error('Token not valid.')
          res.status(500).json({ error: error.message });
          throw error;

        }
      } else {

        const error = new Error('Could not find token with user.')
        res.status(500).json({ error: error.message });
        throw error;

      }
  } catch (e) {
      next(e);
  };
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
      const { body } = req;
      const { user_id, old_password, new_password } = body;
      console.log(user_id);
      const user = await getUserById(user_id);

      if (user) {
        const oldPasswordMatches = await bcrypt.compare(old_password, user?.password);

        if (oldPasswordMatches) {

          if (!schema.validate(new_password)) {
            const error = new Error('Invalid password.')
            res.status(400).json({ error: error.message });
            throw error;
          }

          console.log('here');
          await resetUserPassword(user_id, new_password);
        
          res.status(200).json("Success");

        } else {

          const error = new Error('Old password incorrect.')
          res.status(400).json({ error: error.message });
          throw error;

        }

      } else {

        const error = new Error('Could not find user.')
        res.status(500).json({ error: error.message });
        throw error;

      }
  } catch (e) {
      next(e);
  };
};

export default {
  resetPasswordEmail,
  resetPassword,
  changePassword,
}