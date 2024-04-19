import passwordValidator from 'password-validator';

export const dateFormatter = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = date.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
};

const schema = new passwordValidator();

// Add properties to it
schema
.is().min(8, 'Length must be at least 8')
.is().max(64, 'Length must be at most 64')
.has().uppercase(1, 'Must have an uppercase letter')                              // Must have uppercase letters
.has().lowercase(1, 'Must have a lowercase letter')                              // Must have lowercase letters
.has().digits(1, 'Must have at least 1 digit')                                // Must have at least 2 digits
.has().not().spaces(1, 'Must not have spaces')                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123'], 'Try a different password'); // Blacklist these values

export {schema} ;