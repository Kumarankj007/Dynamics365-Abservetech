"use client";
import Footer from "@/core/components/Footer";
import Navigation from "@/core/components/Navigation";
import Image from "next/image";
import Link from "next/link";

export default function RedirectPage() {
  return (
    <div className="bg-hero-bg">
      <Navigation />
      <div className="flex items-center justify-center h-screen mx-[40px] pt-24">
        <div className="flex-col  items-center text-white">
          <Image
            src="/assets/Page-not-found.svg"
            alt="image"
            width={650}
            height={650}
          />
          <p className="font-semibold text-[20px] text-center">Oops!</p>
          <p className="font-semibold text-[20px] text-center">
            {" "}
            {"We can't seem to find the page you're looking for."}
          </p>
          <div className="text-center mt-6 text-btncolor underline cursor-pointer">
            <Link href={"/"}>Back To Home</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
