import Image from 'next/image';
import React, { useState } from 'react';
import { validate } from './validate'; 
import Services from './services';
import toast from 'react-hot-toast';
export default function UpdateProfile({setIsProfile}) 
{
    // Handel errors   ######################################################################
    const [errors, setErrors] = useState({});

    // Part 1 : handling updating image   ######################################################################
    const [imageSrc, setImageSrc] = useState(null); // State to store the image URL


    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const validTypes = ["image/png", "image/svg+xml"];
        
        // Check if the file type is valid
        if (validTypes.includes(file.type)) {
          // const fileURL = URL.createObjectURL(file); // Create an object URL for the selected file
          setImageSrc(file); // Set the file URL as the image source
          toast.success("File uploaded successfully!"); // Show success toast
        } else {
          setImageSrc(null); // Clear the image preview if invalid file type
          toast.error("Only PNG and SVG files are allowed."); // Show error toast
        }
      }
    };


    
    // Part 2 : handel updating informations   ######################################################################

    const [formData, setFormData] = useState({
        usernameSt: '',
        currentPasswordSt: '',
        newPasswordSt: '',
        confirmPasswordSt: '',
        profile_photo: ''
    });

    const handleOnChange = (e) => 
    {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }





    // part 3 : handle the submiting the form   ######################################################################
    const handleSubmit = async (e) => {
      
      // 1 validation  ------------------------------------------------
        e.preventDefault(); 
        setErrors({});// reset errors
        const validationErrors = validate(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);  // update errors
            
            return ;
        } 

        // 2 update the data object ------------------------------------------------

        const data = {
          username: formData.usernameSt || '',
          current_password: formData.currentPasswordSt || '',
          new_password: formData.newPasswordSt || '',
          profile_image: imageSrc || {},
      };

      // 3 send the data to the backend ------------------------------------------------

      try {
        const result = await Services.updateProfileService(data);
        
          
          if(!result.data.data)
            {
              const errorMsg = result.data.message;
              toast.error(errorMsg)
              // toast.error(errorMsg || "Something Went Wrong!");
            }
            else
            {
              const successMsg = result.data.message;
              toast.success(successMsg);
              setTimeout(() => { window.location.reload();}, 1000); 
            }
        // if (successMsg) {
        //   toast.success(successMsg); // Display a success toast
        //   setTimeout(() => { window.location.reload();}, 1000); 
        // } else {
        //   toast.error("Unexpected response format."); // Handle unexpected format
        // }



        
      }
      catch (error) {
        console.log("Updating profile http request failed... ", error);


      }

            
        
    }


    return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-start sm:items-center absolute top-0 left-0 w-full h-full animate-fadeIn p-4">
    <div className="bg-[#F4F4FF] flex flex-col items-center shadow-lg rounded-xl w-[95%] sm:w-full h-[85vh] sm:h-auto border-solid border-[#BCBCC9] border-2 max-w-[800px] sm:mt-[160px] max-h-[100vh] sm:max-h-[900px] min-h-[500px] sm:min-h-[800px] overflow-y-auto pt-4 sm:pt-8 animate-scaleIn">
      <div className="relative flex flex-col items-center w-full h-full px-3 sm:px-0 motion-preset-expand">
      {/* closeWindowIcon --------------------------------------------------------------------------------------- */}
        <Image
          src="/images/close.svg"
          alt="Close"
          width={32}
          height={32}
          className="closeWindowIcon absolute top-[-8px] sm:top-[15px] right-3 sm:right-11 cursor-pointer w-[22px] h-[22px] sm:w-[32px] sm:h-[32px]"
          onClick={() => setIsProfile(false)}
        />
        {/* Updating Image --------------------------------------------------------------------------------------- */}
        <div className="flex flex-col items-center relative">
          <Image
            src={imageSrc instanceof File ? URL.createObjectURL(imageSrc) : "/images/DefaultAvatar.svg"}
            alt="Profile"
            width={100}
            height={100}
            className="w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] cursor-pointer rounded-full object-cover"
          />
          <div className="absolute bottom-[-5px] right-1 sm:right-6">
            <Image
              src="/images/upload.svg"
              alt="Camera"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer"
              onClick={() => document.getElementById('fileInput').click()}
            />
          </div>
        </div>

        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />
        <h1 className="text-lg sm:text-2xl font-bold tracking-wide text-[#242F5C] pt-4 sm:pt-8">Update Profile</h1>











        {/*  Updating Data --------------------------------------------------------------------------------------- */}
        <form className="w-full h-full flex flex-col items-center justify-center">
          <div className='w-[85%] sm:max-w-[350px] mt-2 sm:mt-4'>
            <label htmlFor="username" className="block mb-1 sm:mb-2 text-sm sm:text-lg font-bold text-[#242F5C]">Username</label>
            <input 
              type="text" 
              id="username" 
              className="bg-[#F8FBFF] border text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:p-3.5" 
              placeholder="Username" 
              required 
              pattern="^[^\s]*$" 
              title="Username should not contain spaces"
              value={formData.usernameSt}
              onChange={handleOnChange}
              name="usernameSt" 
              autoComplete="username"
            />
            {errors.usernameSt && <p className="text-sm text-red-500">{errors.usernameSt}</p>}

            <label htmlFor="Current Password" className="block mb-1 sm:mb-2 mt-3 sm:mt-5 text-sm sm:text-lg font-bold text-[#242F5C]">Current Password *</label>
            <input 
              type="password" 
              id="Current Password" 
              className="bg-[#F8FBFF] border text-gray-900 text-sm rounded-[10px] focus:ring-blue-500  focus:border-blue-500 block w-full p-2.5 sm:p-3.5" 
              placeholder="Current Password" 
              required 
              value={formData.currentPasswordSt} 
              onChange={handleOnChange}
              name="currentPasswordSt"
              autoComplete="current-password"
            />
            {errors.currentPasswordSt && <p className="text-sm text-red-500">{errors.currentPasswordSt}</p>}

            <label htmlFor="New Password" className="block mb-1 sm:mb-2 mt-3 sm:mt-5 text-sm sm:text-lg font-bold text-[#242F5C]">New Password</label>
            <input 
              type="password" 
              id="New Password" 
              className="bg-[#F8FBFF] border text-gray-900 text-sm rounded-[10px] focus:ring-blue-500  focus:border-blue-500 block w-full p-2.5 sm:p-3.5" 
              placeholder="Enter your password" 
              required 
              value={formData.newPasswordSt}
              onChange={handleOnChange}
              name="newPasswordSt"
              autoComplete="new-password"
            />
            {errors.newPasswordSt && <p className="text-sm text-red-500">{errors.newPasswordSt}</p>}

            <label htmlFor="Confirm Password" className="block mb-1 sm:mb-2 mt-3 sm:mt-5 text-sm sm:text-lg font-bold text-[#242F5C]">Confirm Password</label>
            <input 
              type="password" 
              id="Confirm Password" 
              className="bg-[#F8FBFF] border text-gray-900 text-sm rounded-[10px] focus:ring-blue-500  focus:border-blue-500 block w-full p-2.5 sm:p-3.5" 
              placeholder="Confirm your password" 
              required 
              value={formData.confirmPasswordSt}
              onChange={handleOnChange}
              name="confirmPasswordSt"
            />
            {errors.confirmPasswordSt && <p className="text-sm text-red-500">{errors.confirmPasswordSt}</p>}

            <button 
              type="submit" 
              className="text-white mt-5 bg-[#111B47] focus:ring-4 focus:outline-none font-semibold rounded-[10px] text-sm sm:text-lg w-full px-4 sm:px-20 py-2.5 sm:py-3 text-center mb-4 sm:mb-5 transition-transform duration-300 ease-in-out transform hover:scale-105"
              onClick={(e) => handleSubmit(e)}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>);
}
