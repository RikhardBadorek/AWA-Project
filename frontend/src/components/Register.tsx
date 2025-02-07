import React, { useState } from "react";
import "../styles/register.css"

//Handles registeration and send user information to backend

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
    })

    const [error, setError] = useState("")

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name,value,type,checked} = event.target
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    }


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        try {
            const res = await fetch("http://localhost:3000/api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)

            })

            if (res.ok) {
                window.location.href = "/login"
            } else {
                setError("Error when trying to register!")
            }
            
            
        } catch (error) {
            setError(`Error when trying to register: ${(error as Error).message}`)
        }

        
    }


    return (
        <div className="register-container">
            <h1>Register</h1>
            <form className="registerForm" onSubmit={handleSubmit}>
                <div>
                    <input type="email" id="email" name="email" value={formData.email} placeholder="email" onChange={handleChange} required/>
                </div>
                <div>
                    <input type="text" id="username" name="username" value={formData.username} placeholder="username" onChange={handleChange} required/>
                </div>
                <div>
                    <input type="password" id="password" name="password" value={formData.password} placeholder="password" onChange={handleChange} required/>
                </div>
                <button type="submit">Register</button>
            </form>
            <p id="error">{error}</p>
        </div>
    )
}

export default Register
