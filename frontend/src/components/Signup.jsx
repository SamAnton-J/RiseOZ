import axios from 'axios';
import '../static/css/components/Signup.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../blockchain/useWallet';
import { extractSkillsFromTextClient } from '../ai/extractSkills';


const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [linkedInUrl, setLinkedInUrl] = useState("");
    const [skills, setSkills] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const { walletAddress, connect, connectPhantom, setWalletAddress } = useWallet();
    const [experienceText, setExperienceText] = useState("");

    const handleAIFillSkills = async () => {
        try {
            const extracted = await extractSkillsFromTextClient(experienceText);
            const existing = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
            const merged = Array.from(new Set([...existing, ...extracted]));
            setSkills(merged.join(', '));
        } catch (e) {
            console.error('AI skill extraction failed', e);
        }
    }
    // const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignupClick = async () => {
        const skillsArray = skills
            ? skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [];
        const basePayload = {
            username,
            password,
            email,
            linkedInUrl,
            walletAddress,
            skills: skillsArray,
        };
        if (role === 'FREELANCER') {
            axios
                .post('http://localhost:3000/freelancer/signup', {
                    ...basePayload,
                })
                .then((response) => {
                    localStorage.setItem("token", response.data.token);
                    // setMessage(response.data.message);
                    navigate("/")
                })
                .catch((error) => {
                    // setMessage(error.response.data.message)
                    console.error("Error Signing up: ", error);
                })
        }
        else if (role === 'PRODUCER') {
            axios
                .post('http://localhost:3000/producer/signup', {
                    ...basePayload,
                    companyWebsite,
                })
                .then((response) => {
                    localStorage.setItem("token", response.data.token);
                    // setMessage(response.data.message);
                    navigate("/")
                })
                .catch((error) => {
                    // setMessage(error.response.data.message)
                    console.error("Error Signing up: ", error);
                })
        }
    }

    return (
        <>
            <div className="signup_container">
                <div className="heading">
                    Sign Up
                </div>
                <div className="signup_form_fields">
                    <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="" disabled>-- Select Role --</option>
                        <option value="FREELANCER">FREELANCER</option>
                        <option value="PRODUCER">PRODUCER</option>
                    </select>
                    <input type="url" placeholder='LinkedIn URL' value={linkedInUrl} onChange={(e) => setLinkedInUrl(e.target.value)} />
                    {role === 'PRODUCER' && (
                        <input type="url" placeholder='Company Website' value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                        <button type="button" onClick={connect}>{walletAddress ? 'Wallet Connected' : 'Connect MetaMask'}</button>
                        <button type="button" onClick={connectPhantom}>Connect Phantom</button>
                        {walletAddress && (
                            <input
                                type="text"
                                placeholder='Wallet Address'
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                style={{ flex: 1 }}
                            />
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexDirection: 'column' }}>
                        <input
                            type="text"
                            placeholder='Skills (comma separated)'
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                        <textarea
                            rows="3"
                            placeholder='Paste brief experience summary for AI to suggest skills'
                            value={experienceText}
                            onChange={(e) => setExperienceText(e.target.value)}
                        />
                        <button type="button" onClick={handleAIFillSkills}>AI Fill Skills</button>
                    </div>
                </div>
                <div className="signup_form_submit">
                    <button onClick={handleSignupClick}>Join</button>
                    <div className="signup_prompt">
                        <span>Already Have An Account? </span>
                        <a href="/signin">Sign In</a>
                    </div>
                </div>
            </div>
            {/* <div className='backend_message'>
                {message}
            </div> */}
        </>
    )
}

export default Signup;