import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import '../static/css/pages/ProducerDashboard.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Loading from '../components/Loading';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import ChatIcon from "@mui/icons-material/Chat";
import { ethers } from 'ethers';
import { useWallet } from '../blockchain/useWallet';

const style = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 350,
    height: 350,
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0rem',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto'
    // backdropFilter: 'blur(10px)'
};

const ProducerDashboard = () => {
    const [userRole, setUserRole] = useState(localStorage.getItem("role"));
    const [username, setUsername] = useState('');
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [myJobPosts, setMyJobPosts] = useState([]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true)
    const [incomingConnectionRequests, setIncomingConnectionRequests] = useState([])
    const [created, setCreated] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const { walletAddress, ensureConnected, chainId } = useWallet();
    const [txHash, setTxHash] = useState('');

    // Modal
    const [open, setOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState(null)

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setSelectedJob(null)
    }

    const handleApplicantsClick = (job) => {
        setSelectedJob(job)
        handleOpen()
    };

    // Create Job Form State:
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [requirements, setRequirements] = useState('')
    const [skillsRequired, setSkillsRequired] = useState('')
    const [employmentType, setEmploymentType] = useState('')
    const [location, setLocation] = useState('')
    const [salary, setSalary] = useState('')

    const handleJobFormSubmit = async (e) => {
        e.preventDefault();
        const requirementsArray = typeof requirements === 'string'
            ? requirements.split('\n').map((item) => item.trim()).filter(Boolean)
            : [];
        const skillsRequiredArray = typeof skillsRequired === 'string'
            ? skillsRequired.split('\n').map((item) => item.trim()).filter(Boolean)
            : [];

        if (!title?.trim() || !description?.trim()) {
            alert('Title and Description are required');
            return;
        }

        try {
            // Check if wallet is connected
            const addr = await ensureConnected();
            if (!addr) {
                alert('Please connect your wallet first');
                return;
            }

            // Check if MetaMask is available
            if (!window.ethereum) {
                alert('MetaMask is not installed. Please install MetaMask and try again.');
                return;
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Get current network and enforce Ethereum Sepolia (11155111)
            let network = await provider.getNetwork();
            console.log('Current network:', network);

            if (network.chainId !== 11155111) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
                    });
                    // re-read network after switch
                    network = await provider.getNetwork();
                } catch (switchError) {
                    // If the chain has not been added to MetaMask, request to add it
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0xaa36a7',
                                    chainName: 'Ethereum Sepolia',
                                    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                                    rpcUrls: ['https://rpc.sepolia.org'],
                                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                                }],
                            });
                            network = await provider.getNetwork();
                        } catch (addError) {
                            alert('Please switch your MetaMask network to Ethereum Sepolia and try again.');
                            return;
                        }
                    } else {
                        alert('Please switch your MetaMask network to Ethereum Sepolia and try again.');
                        return;
                    }
                }
            }

            if (network.chainId !== 11155111) {
                alert('Please switch your MetaMask network to Ethereum Sepolia and try again.');
                return;
            }

            const networkName = 'Ethereum Sepolia';

            // Get admin wallet address and fee
            const adminWalletAddress = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;
            const platformFee = import.meta.env.VITE_PLATFORM_FEE_ETH || '0.001';

            if (!adminWalletAddress || adminWalletAddress === '0x0000000000000000000000000000000000000000') {
                alert('Admin wallet address not configured. Please contact support.');
                return;
            }

            // Create transaction — fixed platform fee to admin wallet on Sepolia
            const tx = {
                to: adminWalletAddress,
                value: ethers.utils.parseEther(platformFee),
                gasLimit: 21000, // Standard gas limit for simple transfers
            };

            console.log('Sending transaction:', {
                to: tx.to,
                value: ethers.utils.formatEther(tx.value),
                network: networkName
            });

            // Send transaction
            const transactionResponse = await signer.sendTransaction(tx);
            console.log('Transaction sent:', transactionResponse.hash);

            // Wait for confirmation
            const receipt = await transactionResponse.wait();
            console.log('Transaction confirmed:', receipt);

            setTxHash(transactionResponse.hash);

            // Create job payload
            const payload = {
                title,
                description,
                requirements: requirementsArray,
                skillsRequired: skillsRequiredArray,
                employmentType,
                location,
                salary: salary ? Number(salary) : undefined,
                transactionHash: transactionResponse.hash,
                paymentStatus: 'paid',
                network: networkName,
            };

            console.log('Creating job with payload:', payload);

            // Create job
            const { data } = await axios.post(`${API_BASE_URL}/producer/jobs`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Update UI
            const newJob = data?.job || data;
            if (newJob) {
                setMyJobPosts((prevJobs) => [...prevJobs, newJob]);
            }
            setCreated((prev) => !prev);

            // Clear form
            setTitle('');
            setDescription('');
            setRequirements('');
            setSkillsRequired('');
            setEmploymentType('');
            setLocation('');
            setSalary('');

            alert(`Job created successfully! Transaction: ${transactionResponse.hash}`);

        } catch (error) {
            console.error('Error creating job with payment:', error);

            // Provide specific error messages
            if (error.code === 4001) {
                alert('Transaction was rejected by user');
            } else if (error.code === -32603) {
                alert('Network error. Please check your network connection and try again.');
            } else if (error.message?.includes('insufficient funds')) {
                alert('Insufficient funds in wallet. Please add more funds and try again.');
            } else if (error.message?.includes('user rejected')) {
                alert('Transaction was rejected. Please try again.');
            } else if (error.message?.includes('nonce')) {
                alert('Transaction nonce error. Please try again in a few seconds.');
            } else {
                alert(`Payment or job creation failed: ${error.message || 'Unknown error'}`);
            }
        }
    }

    useEffect(() => {
        axios.get(`${API_BASE_URL}/details`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log(response.data)
                const role = response.data.user.payload.role;
                localStorage.setItem("role", role);
                setUserRole(role);
                setUsername(response.data.user.payload.username);
            })
            .catch(error => {
                // console.log(error.response.data)
                console.error('Error fetching user data:', error);
            });
        if (userRole === 'FREELANCER') {
            navigate("/freelancer-dashboard");
        }
    }, []);
    // console.log(token)

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/producer/jobs`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                console.log(response.data)
                setMyJobPosts(response.data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, [created])

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/all-incoming-connection-requests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response.data)
                setIncomingConnectionRequests(response.data);
            })
            .catch((error) => {
                console.error("Error fetching incoming connection requests: ", error)
            })
    }, [accepted])

    // console.log(incomingConnectionRequests)

    const handleAcceptConnectionRequest = (incomingConnectionRequest) => {
        axios
            .patch(`${API_BASE_URL}/accept-connection-request/${incomingConnectionRequest._id}`,
                null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response.data)
                setAccepted(true);
                // setIncomingConnectionRequests((prevRequests) =>
                //     prevRequests.map((request) =>
                //         request._id === incomingConnectionRequest._id
                //         ? { ...request, status: 'accepted' }
                //         : request
                //     )
                // );
            })
            .catch((error) => {
                console.error("Some error accepting the request: ", error)
            })
    }

    const handleRejectConnectionRequest = () => {

    }

    const handleChatClick = () => {
        navigate(`/chat/${userRole}/${username}`)
    }

    const handleProfileClick = () => {
        navigate(`/profile/${userRole}/${username}`)
    }

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    }

    if (token === null) {
        return (
            <div>
                <h1>Unauthorized, Please Signin <a href="/signin">Here</a></h1>
            </div>
        )
    }

    else if (userRole === 'PRODUCER') {
        return (
            <>
                <div className='producer_navbar_container'>
                    <div className='producer_navbar_left'>
                        <a href='/producer-dashboard'>
                            <span className='producer_nav_span_1'>Linked</span>
                            <span className='producer_nav_span_2'>X</span>
                        </a>
                    </div>
                    <div className='producer_navbar_right'>
                        <button className='producer_chat_button' onClick={handleChatClick}><ChatIcon style={{ fontSize: '2rem' }} /></button>
                        <button className='producer_profile_button' onClick={handleProfileClick}><AccountCircleIcon style={{ fontSize: '2rem' }} /></button>
                        <button className='producer_navbar_logout' onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <div className='producer_dash_main_area'>
                    <div className='producer_dash_main_left_area'>
                        <div className='producer_dash_main_left_head'>
                            <span>My Job Posts</span>
                        </div>
                        <div className='producer_dash_main_posts'>
                            {
                                myJobPosts.length ?
                                    (
                                        myJobPosts.map((job, index) => {
                                            return (
                                                <>
                                                    <div className='producer_dash_job_card' key={job._id}>
                                                        <div className='producer_dash_job_card_top'>
                                                            <span>{job.title}</span>
                                                        </div>
                                                        <div className='producer_dash_job_card_bottom'>
                                                            <div className='producer_dash_job_card_bottom_left'>
                                                                <span>{job.employmentType}, {job.location}</span>
                                                            </div>
                                                            <div className='producer_dash_job_card_bottom_right' style={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            }}>
                                                                <button onClick={() => navigate(`/job/${job._id}`)} style={{ padding: '0.75rem 0rem', margin: '0 0.5rem' }}>View Job</button>
                                                                <button onClick={() => handleApplicantsClick(job)} style={{ padding: '0.75rem 2.5rem' }}>Applicants</button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </>
                                            )
                                        })
                                    )
                                    :
                                    (
                                        loading ?
                                            (
                                                <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loading /></div>
                                            )
                                            :
                                            (
                                                <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No Job Posts Created</div>
                                            )
                                    )
                            }
                        </div>
                    </div>

                    {selectedJob && (
                        <Modal
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    Applicants for {selectedJob.title}
                                </Typography>
                                {
                                    selectedJob.applicants.length ?
                                        (
                                            <div
                                                style={{
                                                    background: '#f6f7f8',
                                                    height: '100%',
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                    flexDirection: 'column',
                                                    overflowY: 'auto',
                                                    borderRadius: '1rem'
                                                }}
                                            >
                                                {
                                                    selectedJob.applicants.map((applicant, index) => {
                                                        return (
                                                            <div
                                                                className='applicants_card'
                                                                style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    margin: '0.5rem 0',
                                                                    minHeight: '3rem',
                                                                    width: '90%',
                                                                    borderRadius: '0.5rem',
                                                                    padding: '0.5rem',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'row',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        width: '100%'
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <span style={{ margin: '0 0.75rem' }}>{++index}.</span>
                                                                        <span style={{ margin: '0 0.75rem', fontSize: '1.25rem' }}>{applicant.username}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span><a href={`/profile/${applicant.role}/${applicant.username}`} style={{ textDecoration: 'none', marginRight: '1rem' }}>View Profile</a></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                        :
                                        (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                    width: '100%',
                                                    fontSize: '1.5rem',
                                                    backgroundColor: '#f6f7f8',
                                                    borderRadius: '1rem',
                                                    // transform: 'translateY(-7.5%)'
                                                }}
                                            >
                                                No Applicants Yet
                                            </div>
                                        )
                                }
                            </Box>
                        </Modal>
                    )}

                    <div className='producer_dash_main_right_area'>
                        <div className='producer_dash_main_right_head'>
                            <span>Pending Connection Requests</span>
                        </div>
                        <div className='producer_dash_main_requests'
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                padding: '0.5rem',
                            }}
                        >
                            {
                                incomingConnectionRequests.length ?
                                    (
                                        incomingConnectionRequests.map((incomingConnectionRequest, index) => {
                                            return (
                                                <div
                                                    className='container'
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '4rem',
                                                        borderRadius: '1rem',
                                                        padding: '0.25rem 0',
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        margin: '0.25rem 0',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <div>
                                                            <span style={{ margin: '0 1.5rem' }}>{++index}.</span>
                                                            <span style={{ margin: '0 1.5rem', fontSize: '1.25rem' }}><a href={`/profile/${incomingConnectionRequest.senderId.role}/${incomingConnectionRequest.senderId.username}`}>{incomingConnectionRequest.senderId.username}</a></span>
                                                            <span style={{ margin: '0 1.5rem', fontSize: '1.25rem' }}>{incomingConnectionRequest.senderId.role}</span>
                                                        </div>
                                                        <div>
                                                            <button
                                                                style={{
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    padding: '0',
                                                                    outline: 'none',
                                                                    margin: '0 0.25rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => handleAcceptConnectionRequest(incomingConnectionRequest)}
                                                            >
                                                                <DoneIcon />
                                                            </button>
                                                            <button
                                                                style={{
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    padding: '0',
                                                                    outline: 'none',
                                                                    margin: '0 1.25rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={handleRejectConnectionRequest}
                                                            >
                                                                <ClearIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )
                                    :
                                    (
                                        loading ?
                                            (
                                                <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loading /></div>
                                            )
                                            :
                                            (
                                                <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No Pending Connection Requests</div>
                                            )
                                    )
                            }
                        </div>
                        <div className='producer_dash_main_right_head'>
                            <span>Create Job</span>
                        </div>
                        <div className='producer_dash_main_job_post_form'>
                            {/* <div className='producer_job_form_heading'>
                                <span>Details</span>
                            </div> */}
                            <div className='producer_job_form_title'>
                                <span>Title</span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Enter Title'
                                />
                            </div>
                            <div className='producer_job_form_description'>
                                <label htmlFor="description">Description:</label>
                                <textarea
                                    name="description"
                                    rows="5"
                                    cols="67"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter Description"
                                />
                            </div>
                            <div className='producer_job_form_requirements'>
                                <label htmlFor='requirements'>Requirements (one per line):</label>
                                <textarea
                                    rows="5"
                                    cols="67"
                                    name='requirements'
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    placeholder="Enter requirements"
                                />
                            </div>
                            <div className='producer_job_form_skills'>
                                <label htmlFor='skills'>Skills (one per line):</label>
                                <textarea
                                    name='skills'
                                    value={skillsRequired}
                                    onChange={(e) => setSkillsRequired(e.target.value)}
                                    placeholder="Enter skills"
                                />
                            </div>
                            <div className='producer_job_form_employment_type'>
                                <label htmlFor='employment'>Employment Type:</label>
                                <select name='employment' value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                                    <option value="">Select Employment Type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>
                            <div className='producer_job_form_location'>
                                <label htmlFor='location'>Location:</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter location"
                                />
                            </div>
                            <div className='producer_job_form_salary'>
                                <label htmlFor='salary'>Salary:</label>
                                <input
                                    name='salary'
                                    type="number"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="Enter salary"
                                />
                            </div>
                            <div className='producer_job_form_submit'>
                                <button onClick={handleJobFormSubmit}>Create Job</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default ProducerDashboard