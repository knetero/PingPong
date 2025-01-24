

"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import authService from "../authService";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import customAxios from "../customAxios";
import Spinner from "../components/Loading";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const CLIENT_CODE = process.env.NEXT_PUBLIC_INTRA_CLIENT_ID;
const HOST = process.env.NEXT_PUBLIC_HOST_NAME;

const validate = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

function LoginPage() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values) {
    try {
      const response = await authService.login(values.email, values.password);
      if (!response.data.data) {
        const errorMsg = response.data.message;
        toast.error(errorMsg || "Something Went Wrong!");
      } else {
        if (response.data.data.tokens.access) {
          if(response.data.data.user.is_2fa){
            router.replace("/authLogin");
            
          }
          else
            router.replace("/Dashboard");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Login failed. Please try again.");
    }
  }

  function handle42API(e) {
    const clientCode =`${CLIENT_CODE}`;
    const redirectUrl = `https://${HOST}/api/oauth/user_data`;
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${clientCode}&redirect_uri=${redirectUrl}/&response_type=code&scope=public%20projects&prompt=consent`;
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
      } catch (error) {
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
      className={`h-screen flex justify-center items-center ${montserrat.className}`}
    >
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#111B47",
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: "red",
            },
          },
        }}
      />
      <form
        onSubmit={formik.handleSubmit}
        className={`${
          !isMobile ? "bg-[rgba(66,74,120,0.05)]" : "border-none"
        } motion-preset-expand max-w-[700px] z-[10] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] bg-blend-hard-light ${
          !isMobile ? "shadow-[inset_0px_0px_4.6px_#A8B4FF]" : ""
        } p-8 rounded-xl h-[700px] w-[600px] flex flex-col items-center`}
      >
        <div className="w-full flex justify-center motion-scale-in-[0.5] motion-translate-x-in-[-120%] motion-translate-y-in-[-60%] motion-opacity-in-[33%] motion-rotate-in-[-380deg] motion-blur-in-[10px] motion-delay-[0.38s]/scale motion-duration-[0.38s]/opacity motion-duration-[1.20s]/rotate motion-duration-[0.15s]/blur motion-delay-[0.60s]/blur motion-ease-spring-bouncier">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-[100px] h-[100px] object-contain"
            priority
          />
        </div>
        <h1 className="sm:text-4xl text-xl text-center text-[#111B47] font-bold">
          Login to your account
        </h1>
        <div className="mb-5 mt-8 max-w-[350px] w-full flex flex-col justify-center items-center">
          <div className="max-w-[350px] w-full">
            <label
              htmlFor="email"
              className="block mb-2 text-lg font-bold text-gray-900 text-[#111B47]"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              className={`${
                formik.errors.email && formik.touched.email
                  ? "border-red-500"
                  : ""
              } bg-[#F8FBFF] border border-gray-300 text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 focus:border-blue-500 block w-full p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
            />
            {formik.errors.email && formik.touched.email && (
              <p className="text-red-500 text-sm mt-2 animatedInputError font-medium">
                {formik.errors.email}
              </p>
            )}
            <label
              htmlFor="password"
              className="block mb-2 mt-5 text-lg font-bold text-gray-900 text-[#111B47]"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              className={`${
                formik.errors.password && formik.touched.password
                  ? "border-red-500"
                  : ""
              } bg-[#F8FBFF] border border-gray-300 text-gray-900 text-sm rounded-[10px] focus:ring-blue-500 mb-5 focus:border-blue-500 block w-full p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Enter your password"
              {...formik.getFieldProps("password")}
            />
            {formik.errors.password && formik.touched.password && (
              <p className="text-red-500 text-sm mb-5 mt-[-10px] animatedInputError font-medium">
                {formik.errors.password}
              </p>
            )}
            <button
              type="submit"
              className="text-white bg-[#111B47] focus:ring-4 focus:outline-none font-semibold rounded-[10px] text-lg w-full px-20 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-600 dark:focus:ring-blue-800 mb-5 transition-transform duration-300 ease-in-out transform hover:scale-105"
            >
              Login
            </button>
          </div>
          <p className="font-medium text-[#111B47] pb-2 flex justify-center">
            Don&apos;t have an account?{" "}
            <span className="font-semibold transition-transform duration-300 ease-in-out text-sm sm:text-base transform hover:scale-110 ">
              &nbsp; <Link href="/signup">Sign up</Link>
            </span>
          </p>
          <button
            type="button"
            className="flex items-center justify-center gap-4 text-black bg-[#BFD5F6] focus:ring-4 focus:outline-none focus:ring-blue-300 sm:w-[80%] sm:w-[70%] font-semibold rounded-[10px] text-base sm:px-10 sm:py-3 px-5 py-5 text-center dark:bg-blue-600 mt-5 mb-2 transition-transform duration-300 ease-in-out transform hover:scale-105"
            onClick={handle42API}
          >
            <Image
              src="images/42_Logo 1.svg"
              alt="Logo"
              width={40}
              height={40}
              className="w-[40px] h-[40px] object-contain"
              priority
            />
            Login Intra
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
