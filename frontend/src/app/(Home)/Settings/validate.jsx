// validate.js or formValidation.js

export const validate = (formData) => {
    const errors = {};
      

    
    if (formData.usernameSt !== '' && formData.usernameSt.length > 15) {
      errors.usernameSt = 'Username must be 15 characters or less';
    } else if (formData.usernameSt !== '' && formData.usernameSt.length < 2) {
      errors.usernameSt = 'Username must be at least 2 characters';
    } else if (formData.usernameSt !== '' && !/^[A-Za-z0-9]+$/.test(formData.usernameSt)) {
      errors.usernameSt = 'Username must contain only letters and numbers with no spaces';
    }
  
    if (formData.currentPasswordSt === '') {
      errors.currentPasswordSt = 'Current password is missing';
    }

    
    // if (formData.currentPasswordSt === '' && formData.newPasswordSt !== '') {
    //   errors.currentPasswordSt = 'Current password is missing';
    // }
    // if (formData.currentPasswordSt !== '' && formData.newPasswordSt === '') {
    //   errors.newPasswordSt = 'New password is missing';
    // }
    
    if (formData.newPasswordSt !== '' && formData.newPasswordSt.length < 6) {
      errors.newPasswordSt = 'Password must be at least 6 characters';
    }
  
    
    if (formData.confirmPasswordSt !== formData.newPasswordSt) {
      errors.confirmPasswordSt = 'Passwords do not match';
    }

    


    // console.log(errors);
    return errors;
};
