import React, { useState } from "react";
import "../styles/Login.css"

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [error, setError] = useState("")

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name,value} = event.target
        
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        try {
            const res = await fetch("http://localhost:3000/api/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)

            })

            if (res.ok) {
                const data = await res.json()

                if(data.token) {
                    localStorage.setItem("token", data.token)
                    window.location.href = "/"
                }

            } else {
                setError("Error when trying to login!")
            }
            
            
        } catch (error) {
            setError(`Error when trying to login: ${(error as Error).message}`)
        }

        
    }


    return (
        <div className="login-container">
            <h1>Login</h1>
            <form className="loginForm" onSubmit={handleSubmit}>
                <div>
                    <input type="email" id="email" name="email" value={formData.email} placeholder="email" onChange={handleChange} required/>
                </div>
                
                <div>
                    <input type="password" id="password" name="password" value={formData.password} placeholder="password" onChange={handleChange} required/>
                </div>
                
                <button type="submit">Login</button>
            </form>
            <p id="error">{error}</p>
        </div>
    )
}

export default Login
