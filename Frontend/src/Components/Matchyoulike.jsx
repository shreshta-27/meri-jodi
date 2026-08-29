import ProfileImage from "../assets/female_profile2.jpg";
import { ArrowRight } from "lucide-react";

const Matchyoulike = () => {
  const matches = [
    {
      image: ProfileImage,
      profession: "LAWYER",
      name: "Ishani D",
    },
    {
      image: ProfileImage,
      profession: "MANAGER",
      name: "Pratiksha Bedi",
    },
    {
      image: ProfileImage,
      profession: "BANKER",
      name: "Ishani Shah",
    },
    {
      image: ProfileImage,
      profession: "ACTRESS",
      name: "Isha Patel",
    },
  ];

  return (
    <div className="pt-10 min-w-[85rem] p-10 px-20   bg-[#f8f4f4] ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-serif font-semibold text-[#2f2f2f] mb-5">
          Matches You Would Like to View
        </h2>

        <button className="flex items-center gap-2 text-[#b3243a] font-semibold hover:gap-3 transition-all">
          View All
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {matches.map((match, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl h-[430px] group cursor-pointer"
          >
            <img
              src={match.image}
              alt={match.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
              <p className="text-[11px] tracking-[2px] uppercase font-medium">
                {match.profession}
              </p>

              <h3 className="text-xl font-medium mt-1">
                {match.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matchyoulike;