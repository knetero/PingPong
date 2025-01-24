"use client";
import { Inter, Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useFormik } from 'formik';
import axios from 'axios';
import authService from '../authService';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import customAxios from '../customAxios';
import Spinner from '../components/Loading';





const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const validate = values => {
  const errors = {};
  if (!values.username) {
    errors.username = 'Username is required';
  }
  else if (values.username.length > 10) {
    errors.username = 'Username must be 10 characters or less';
  }
  else if (values.username.length < 2) {
    errors.username = 'Username must be at least 2 characters';
  } else if (!/^[A-Za-z0-9]+$/.test(values.username)) {
    errors.username = 'Username must contain only letters and numbers with no spaces';
  }
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Password do not match';
  }
  return errors;
};


function Signup_page() {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate,
    onSubmit: values => {
      handleSubmit(values);
    },
    handleBlur: (e) => {
      const { name, value } = e.target;
      formik.setFieldValue(name, value);
      formik.setFieldError(name, validate({ [name]: value })[name]);
    },
  });

  const handleSubmit = async (values) => {
    const FinalValues = {
      username: values.username,
      email: values.email,
      password: values.password,
    }

    try {
        const response = await authService.signup(FinalValues.username, FinalValues.email, FinalValues.password);
        if(!response.data.data){
          const errorMsg = response.data.message;
         
          toast.error(
            errorMsg['username']?.[0] ||
            errorMsg['email']?.[0] ||
            errorMsg['password']?.[0] ||
            'Something Went Wrong!'
          );
        }
        else {
          router.push('/login');
        }
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        const response = await customAxios.get(
          "https://10.13.7.8/api/api/user_logged_in/",
          {
            withCredentials: true,
          }
        );
        if (response.data.message === "done") {
          if(response.data.data.is_2fa){ 
            router.replace("/authLogin");
          }
          else
            
            router.replace("/Dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {;
        console.log(error.message);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }



  return (
    
    <div
      className={`h-[100vh] flex justify-center items-center ${montserrat.className}`}
    >
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#111B47',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: 'red',
            },
          },
        }}
      />
      <form
        className={`${!isMobile ? "bg-[rgba(66,74,120,0.05)]" : "border-none"} motion-preset-expand max-w-[700px] w-[90%]  bg-blend-hard-light ${!isMobile ? "shadow-[inset_0px_0px_4.6px_#A8B4FF]" : ""} p-8 rounded-xl  w-[600px] flex flex-col items-center`}
        onSubmit={formik.handleSubmit}
      >
        <div className="w-full flex justify-center motion-scale-in-[0.5] motion-translate-x-in-[-120%] motion-translate-y-in-[-60%] motion-opacity-in-[33%] motion-rotate-in-[-380deg] motion-blur-in-[10px] motion-delay-[0.38s]/scale motion-duration-[0.38s]/opacity motion-duration-[1.20s]/rotate motion-duration-[0.15s]/blur motion-delay-[0.60s]/blur motion-ease-spring-bouncier">
          <Image src="/images/logo.png" alt="Logo" width={100} height={100} className="w-[100px] h-[100px] object-contain"/>
        </div>
        <h1 className="sm:text-4xl text-xl text-center text-[#111B47] font-bold">
          Create your account
        </h1>
        <div className="mb- mt-8 max-w-[350px] w-full flex flex-col justify-center items-center min-h-[340px] max-h-[700px]">
          <div className="max-w-[350px] w-full">
            <label
              htmlFor="username"
              className="block mb-2 text-lg font-bold text-gray-900 text-[#111B47]"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              className={`${formik.errors.username && formik.touched.username ? 'border-red-500' : ''} bg-[#F8FBFF] border mb-[5px] text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 focus:border-blue-500 block w-full p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Username"
              onBlur={formik.handleBlur}
            />
            {formik.errors.username && formik.touched.username && <p className="text-red-500 text-sm animatedInputError font-medium mt-[10px]">{formik.errors.username}</p>}
            <label
              htmlFor="email"
              className="block mt-5 text-lg font-bold text-gray-900 text-[#111B47]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className={`${formik.errors.email && formik.touched.email ? 'border-red-500' : ''} bg-[#F8FBFF] border mt-[5px] text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 focus:border-blue-500 block w-full p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="name@gmail.com"
              onBlur={formik.handleBlur}
            />
            {formik.errors.email && formik.touched.email && <p className="text-red-500 text-sm pt-3 animatedInputError font-medium mb-[-6px]">{formik.errors.email}</p>}
            <label
              htmlFor="password"
              className="block mb-2 mt-5 text-lg font-bold text-gray-900 text-[#111B47]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              className={`${formik.errors.password && formik.touched.password ? 'border-red-500' : ''} bg-[#F8FBFF] border mt-[5px] text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 mb-5 focus:border-blue-500 block w-full p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Enter your password"

              onBlur={formik.handleBlur}
            />
            {formik.errors.password && formik.touched.password && <p className="text-red-500 text-sm animatedInputError font-medium mt-[-10px]">{formik.errors.password}</p>}
            <label
              htmlFor="Confim Password"
              className="block mb-2 mt-5 text-lg font-bold text-gray-900 text-[#111B47]"
            >
              Confim Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              className={`${formik.errors.confirmPassword && formik.touched.confirmPassword ? 'border-red-500' : ''} bg-[#F8FBFF] border mt-[5px] text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 mb-5 focus:border-blue-500 block w-full p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Confirm your password"
              onBlur={formik.handleBlur}
            />
            {formik.errors.confirmPassword && formik.touched.confirmPassword && <p className="text-red-500 text-sm pb-3 animatedInputError font-medium mt-[-10px] mb-5">{formik.errors.confirmPassword}</p>}
            <button
              type="submit"
              className="text-white bg-[#111B47] focus:ring-4 focus:outline-none font-semibold rounded-[10px] text-lg w-full px-20 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-600 dark:focus:ring-blue-800 mb-5 transition-transform duration-300 ease-in-out transform hover:scale-105"
            >
              Sign up
            </button>
          </div>
          <p className="font-medium text-[#111B47] pb-2  flex justify-center">
            Already have an account?{" "}
            <span className="font-semibold transition-transform duration-300 ease-in-out transform hover:scale-110">
              &nbsp; <Link href="/login">Login</Link>
            </span>
          </p>
        </div>
      </form>

    </div>
  );
}

export default Signup_page;
