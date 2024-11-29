import React from "react";

const Header = () => {
    return(
        <div className="flex justify-center items-center bg-iwhite px-6 py-4 sticky bottom-0 z-10" style={{boxShadow: "0px -2px 5px rgba(0,0,0,0.1)"}}>
            <p className="font-medium mdMax:text-sm">© 2024 <span className="text-[#e77625]">iLTAF</span> All Rights Reserved.</p>
        </div>
    )
}
export default Header;