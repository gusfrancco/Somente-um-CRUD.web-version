import { useState } from "react";
import { UserContext } from "./UserCtx";

export default function UserProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const login = (name, email) => {
    setUserName(name);
    setUserEmail(email);
  };

  const logout = () => {
    setUserName("");
    setUserEmail("");
  };

  return (
    <UserContext.Provider value={{ userName, userEmail, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
