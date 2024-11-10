import Image from "next/image";

export default function Home() {
  return (
   <div className="flex flex-col justify-center items-center w-full h-full">
    <img className="w-32 h-32" src="/images/gorilla_logo.png" alt="" />
    <h1 className="text-3xl font-bold">Welcome in Roster Management</h1>
   </div>
  );
}
