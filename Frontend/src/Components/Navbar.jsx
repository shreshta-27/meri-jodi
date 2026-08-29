import logo2 from '../assets/logo2.png'
import { useNavigate } from "react-router-dom";
const Navbar = () => {
    const navigate = useNavigate();
  return (
    <nav className="w-full border-b bg-[#FFF4F6] shadow-[#8420287d] shadow-opacity-20 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">
            <div className="logo">
                <img src={logo2} alt="MeriJodi Logo" className="h-10 " />
            </div>  
 
            <div className="hidden md:flex items-center gap-12 ">
            <a href="#home" className="relative inline-block font-normal text-[#1A1A1AB2] text-base
                    hover:text-[#D8465C]
                    after:content-['']
                    after:absolute after:left-0 after:-bottom-[5px]
                    after:h-[2px] after:w-0
                    after:bg-[#D8465C]
                    after:transition-all after:duration-500 after:ease-out
                    hover:after:w-full">
                Home
            </a>    
            <a  href="#about" className="relative inline-block font-normal text-[#1A1A1AB2] text-base
                    hover:text-[#D8465C]
                    after:content-['']
                    after:absolute after:left-0 after:-bottom-[5px]
                    after:h-[2px] after:w-0
                    after:bg-[#D8465C]
                    after:transition-all after:duration-500 after:ease-out
                    hover:after:w-full">
                About
            </a>
            <a href="#contact" className="relative inline-block font-normal text-[#1A1A1AB2] text-base
                    hover:text-[#D8465C]
                    after:content-['']
                    after:absolute after:left-0 after:-bottom-[5px]
                    after:h-[2px] after:w-0
                    after:bg-[#D8465C]
                    after:transition-all after:duration-500 after:ease-out
                    hover:after:w-full">
                BrowseMatch
            </a>
            </div>
 

            <button onClick={() => navigate("/login")} className="rounded-4xl bg-white px-8 py-2 text-[#842029] font-medium text-base   hover:bg-[#D8465C] hover:text-white hover:outline-2 outline-1  ">
            Login
            </button>

        </div>
    </nav>
  )
}

export default Navbar