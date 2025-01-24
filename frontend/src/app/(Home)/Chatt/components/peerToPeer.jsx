

import React from 'react';

export function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${formattedMinutes} ${ampm}`;
  }


// DOM Manipulation Functions


export function createFriendMsgBox(time, msg) {
    let theMsg;
    theMsg = document.createElement("div");
    theMsg.className = "friendMsgBox ml-1 my-1";

    let timeSpan;
    timeSpan = document.createElement("span");
    timeSpan.className = "msgTime text-sm pl-5 text-[#242F5C] block";
    timeSpan.textContent = time;

    let msgParagraph;
    msgParagraph = document.createElement("p");
    msgParagraph.className = "msgConetnt text-xl py-3 px-6 inline-block text-[#FFFFFF] bg-[#2C3E86] bg-opacity-80 rounded-3xl ";
    msgParagraph.textContent = msg;

    theMsg.appendChild(timeSpan);
    theMsg.appendChild(msgParagraph);

    return theMsg;
  }

  export function createMyMsgBox(time, msg) {
    let theMsg;
    theMsg = document.createElement("div");
    theMsg.className = "myMsgBox my-1 mr-8 ml-auto flex flex-col";

    let timeSpan;
    timeSpan = document.createElement("span");
    timeSpan.className = "msgTime text-sm pr-5 text-[#242F5C] ml-auto";
    timeSpan.textContent = time;

    let msgParagraph;
    msgParagraph = document.createElement("p");
    msgParagraph.className =
      "msgConetnt text-xl py-3 px-6 inline-block text-[#242F5C] bg-[#9191D6] bg-opacity-40 rounded-3xl ";
    msgParagraph.textContent = msg;

    theMsg.appendChild(timeSpan);
    theMsg.appendChild(msgParagraph);

    return theMsg;
  }

//{`${time.slice(0, 10)} ${time.slice(11, 16)}`}
// React Components

export function FriendMsgBox({ time, msg }) {
    return (
      <div className="friendMsgBox ml-1 my-1">
        <span className="msgTime text-sm pl-5 text-[#242F5C] block">
        {`${time.slice(11, 16)}`}
        </span>
        <p className="msgConetnt text-xl py-3 px-6 inline-block  text-[#242F5C] bg-[#9191D6] bg-opacity-40 rounded-3xl       break-all whitespace-pre-wrap overflow-hidden">
          {msg}
        </p>
      </div>
    );
  }

export function MyMsgBox({ time, msg }) {
    return (
      <div className="myMsgBox my-1 mr-1 ml-auto flex flex-col">
        <span className="msgTime text-sm pr-5 text-[#242F5C] ml-auto">
        { `${time.slice(11, 16)}`}
        </span>
        <p className="msgConetnt text-xl py-3 px-6 inline-block text-[#FFFFFF] bg-[#2C3E86]  bg-opacity-80 rounded-3xl      break-all whitespace-pre-wrap overflow-hidden">
          {msg}
        </p>
      </div>
    );
  }


