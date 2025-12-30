import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type FormEvent, type SetStateAction } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInput(event.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userEmail", input);
    navigate("/chat");
  };

  return (
    <div className="flex flex-col justify-center w-auto items-center min-h-screen">
      <h2 className="text-2xl text-black">Sign In</h2>
      <form
        className="flex flex-col justify-center w-full max-w-sm gap-4"
        onSubmit={handleSubmit}
      >
        <label htmlFor="email" className="text-black">Email</label>
        <Input
          name="email"
          placeholder="Type your email..."
          required
          type="email"
          value={input}
          onChange={handleChange}
          className="border-black focus:border-black"
        />
        <Button type="submit" className="max-w-fit bg-black hover:bg-black text-white">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Login;
