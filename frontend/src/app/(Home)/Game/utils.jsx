import "./styles.css";
import React, { useState } from 'react';
import { Montserrat } from "next/font/google";


const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
})

export default function CheckBox({ selected, handleChange }) {
    return (
        <div className={`flex justify-around items-center w-full max-w-[900px] ${montserrat.variable} font-sans`}>
            <label className=" cursor-pointer">
                <input
                    type="checkbox"
                    checked={selected === 'Beginner'}
                    onChange={() => handleChange('Beginner')}
                    className="form-checkbox h-10 w-10 text-[#242F5C] rounded-full"
                />
                <span className="text-[#242F5C] text-lg lg:text-2xl font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>Beginner</span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={selected === 'Medium'}
                    onChange={() => handleChange('Medium')}
                    className="form-checkbox h-5 w-5 text-[#242F5C] rounded-full"
                />
                <span className="text-[#242F5C] text-lg lg:text-2xl  font-bold" style={{ fontFamily: 'var(--font-montserrat)' }} >Medium</span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={selected === 'Hard'}
                    onChange={() => handleChange('Hard')}
                    className="form-checkbox h-5 w-5 text-[#242F5C] rounded-full"
                />
                <span className="text-[#242F5C] text-lg lg:text-2xl  font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>Hard</span>
            </label>
        </div>
    );
}
