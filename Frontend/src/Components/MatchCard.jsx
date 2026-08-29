import {
  MapPin,
  GraduationCap,
  Briefcase,
  X,
} from "lucide-react";
import female_profile2 from "../assets/female_profile2.jpg";


export default function MatchCard() {
  return (
    <div className="bg-white w-[65rem]  h-[340px] rounded-xl shadow-sm overflow-hidden flex">
      <img src={female_profile2} alt="Female Profile" className="w-[330px] h-[340px] rounded-2xl  object-cover" />

      <div className=" relative ">
        <div className="absolute flex items-center whitespace-nowrap bottom-3 right-3 bg-[#ff6b7b] text-white px-4 py-2 rounded-full font-semibold text-sm">
          94% Match 
        </div>
      </div>

      {/* CONTENT */}

      <div className="flex-1 p-6 relative">
        <button className="absolute right-10 top-10">
          <X size={30} className="text-gray-500" />
        </button>

        <h2 className="font-serif text-[30px] font-bold text-[#7b001c]">
          Aavya Sharma, 26
        </h2>

        <div className="flex flex-wrap items-center gap-5 mt-4 text-gray-700 text-[14px]">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            Mumbai
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap size={18} />
            M.Tech, IIT Bombay
          </div>

          <div className="flex items-center gap-2">
            <Briefcase size={18} />
            Software Engineer at Google
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <span className="bg-[#FFDAD9] px-4 py-2 rounded-full text-[#7b001c] text-base">
            Traditional Values
          </span>

          <span className="bg-[#FFDAD9] px-4 py-2 rounded-full text-[#7b001c] text-base">
            Passionate Traveler
          </span>
        </div>

        <div className="mt-4 border-l-4 border-[#e5d6d6] bg-[#F5F3F3] p-3 rounded-r-xl">
          <p className="italic text-gray-600 text-[14px] leading-relaxed">
            "I was really impressed by your thoughts on balancing
            modern career goals with traditional values. I'd love
            to connect and learn more about your..."
          </p>
        </div>

        <div className="flex gap-4 mt-6  text-[#b31f38]">
        <button className="flex-1 h-12 rounded-full border-2 border-[#b31f38] bg-white text-[#b31f38] font-semibold hover:bg-[#b31f38] hover:text-white  transition-all duration-300 text-lg ">
          Send Interest
        </button>

        <button className="flex-1 h-12 rounded-full border-2 border-[#b31f38] bg-white text-[#b31f38] font-semibold hover:bg-[#b31f38] hover:text-white  transition-all duration-300 text-lg ">
          View Profile
        </button>
      </div>
      </div>
    </div>
  );
}