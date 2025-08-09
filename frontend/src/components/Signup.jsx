import axios from 'axios';
import '../static/css/components/Signup.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../blockchain/useWallet';
import { extractSkillsFromTextClient } from '../ai/extractSkills';
import { API_BASE_URL } from '../api/config';


const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [linkedInUrl, setLinkedInUrl] = useState("");
    const [skills, setSkills] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const { walletAddress, connect, setWalletAddress } = useWallet();
    const [experienceText, setExperienceText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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

    const handleConnectWallet = async () => {
        try {
            setErrorMessage('');
            if (!window.ethereum) {
                setErrorMessage('MetaMask not found. Please install MetaMask.');
                return;
            }

            // Request account access - this will show account selection if multiple accounts exist
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts && accounts.length > 0) {
                const currentAddress = accounts[0];
                setWalletAddress(currentAddress);
                console.log('Connected to account:', currentAddress);
            } else {
                setErrorMessage('No accounts found. Please connect your wallet.');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            if (error.code === 4001) {
                setErrorMessage('Wallet connection was rejected');
            } else if (error.code === -32002) {
                setErrorMessage('Wallet connection already in progress');
            } else {
                setErrorMessage(`Wallet connection failed: ${error.message}`);
            }
        }
    };

    const handleSwitchAccount = async () => {
        try {
            setErrorMessage('');

            // Clear current wallet state
            setWalletAddress('');

            // Show instructions to user - MetaMask doesn't have a built-in way to force account selection
            // So we guide the user to manually switch accounts in MetaMask
            alert(
                'To switch accounts:\n\n' +
                '1. Open MetaMask\n' +
                '2. Click on the account dropdown (top of MetaMask)\n' +
                '3. Select the account you want to use\n' +
                '4. Come back here and click "Connect MetaMask" again\n\n' +
                'Click OK to continue.'
            );

        } catch (error) {
            console.error('Failed to switch account:', error);
            setErrorMessage(`Failed to switch account: ${error.message}`);
        }
    };

    const navigate = useNavigate();

    const handleSignupClick = async () => {
        setErrorMessage("");
        if (!username || !password || !email) {
            setErrorMessage('Please fill username, password, and email');
            return;
        }
        if (!role) {
            setErrorMessage('Please select a role');
            return;
        }

        // Check if wallet is connected
        if (!walletAddress) {
            setErrorMessage('Please connect your wallet first');
            return;
        }

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
        try {
            setSubmitting(true);
            if (role === 'FREELANCER') {
                const { data } = await axios.post(`${API_BASE_URL}/freelancer/signup`, {
                    ...basePayload,
                });
                localStorage.setItem('token', data.token);
                navigate('/');
            } else if (role === 'PRODUCER') {
                const { data } = await axios.post(`${API_BASE_URL}/producer/signup`, {
                    ...basePayload,
                    companyWebsite,
                });
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setErrorMessage('Please select a valid role');
            }
        } catch (error) {
            console.error('Error Signing up: ', error);
            const apiMsg = error?.response?.data?.message || 'Signup failed';
            setErrorMessage(apiMsg);
        } finally {
            setSubmitting(false);
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
                    {/* Wallet Connection Section */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                        {/* Connect MetaMask button - connects to current active account */}
                        <button
                            type="button"
                            onClick={handleConnectWallet}
                            style={{
                                backgroundColor: walletAddress ? '#4CAF50' : '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                            }}
                        >
                            {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect MetaMask'}
                        </button>
                        {/* Switch Account button - clears current connection and prompts user to switch in MetaMask */}
                        {walletAddress && (
                            <button
                                type="button"
                                onClick={handleSwitchAccount}
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Switch Account
                            </button>
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
                    {errorMessage && (<div style={{ color: 'crimson', marginBottom: '0.5rem', maxWidth: '18rem', textAlign: 'center' }}>{errorMessage}</div>)}
                    <button disabled={submitting} onClick={handleSignupClick}>{submitting ? 'Joining...' : 'Join'}</button>
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