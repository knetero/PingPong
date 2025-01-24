import Image from "next/image";

function BoardTemplate({ number, user }) {
  return (
    <div className="flex items-center bg-[#E1E0F2] m-3 py-1 pl-3 rounded-full relative text-[#242F5C] lg:text-xl">
      <h2 className="font-bold ml-1 ">{number}</h2>
      <Image
        src={user.avatar}
        alt="avatarprofile"
        width={50}
        height={50}
        className="absolute w-[50px] h-[50px]  transform -translate-x-[-40px] translate-y-[-50%] top-[50%] overflow-hidden"
      />
      <h2 className="ml-20 left-60 font-bold">{user.userName}</h2>
    </div>
  );
}

export default function LeaderBoard({ first, second, third }) {
  return (
    <div className=" flex flex-col shadow-md shadow-[#BCBCC9] border border-[#BCBCC9] rounded-2xl bg-[#F4F4FF] h-auto w-[80%] mt-6">
      <h1 className="text-[#444E74]  h-[18%] font-black text-center pt-4 mb-5 tracking-wider text-md md:text-lg lg:text-2xl ">
        LEADER BOARD
      </h1>
      <BoardTemplate number="01" user={first} />
      <BoardTemplate number="02" user={second} />
      <BoardTemplate number="03" user={third} />
    </div>
  );
}
