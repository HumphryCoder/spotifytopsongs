import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const clientId = "6e3a0b362aba4ea595706af76163c25a";

function Dashboard() {
    const [topTracks, setTopTracks] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()

    useEffect(() => {
        const storedAccessToken = localStorage.getItem("accessToken");
        const code = searchParams.get('code');
      
        if (storedAccessToken) {
          fetchTopTracks(storedAccessToken).catch(error => {
            // If a 401 error is caught, it means the access token has expired
            if (error.response && error.response.status === 401) {
              // Redirect the user to the LoginPage to refresh the token
              // Replace '/login' with your actual login route
              navigate('/loginpage');
            }
          });
        } else if (code) {
          getAccessToken(clientId, code).then(fetchedAccessToken => {
            if (fetchedAccessToken) {
              localStorage.setItem("accessToken", fetchedAccessToken);
              fetchTopTracks(fetchedAccessToken);
            }
          });
        }
      }, [searchParams, navigate]);

        const getAccessToken = async (clientId, code) => {
            const verifier = localStorage.getItem("verifier");

            const params = new URLSearchParams();
            params.append("client_id", clientId);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", "https://helsingdigital.vercel.app/dashboard");
            params.append("code_verifier", verifier);

            try {
                const result = await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params,
                });

                if (!result.ok) {
                    throw new Error(`Failed to get access token: ${result.status} - ${result.statusText}`);
                }

                const { access_token, refresh_token } = await result.json();

                // Store access token in localStorage
                localStorage.setItem("accessToken", access_token);
                localStorage.setItem("refreshToken", refresh_token);
                console.log(access_token)

                return access_token;
            } catch (error) {
                console.error("Error getting access token:", error);
            }
        };

      

        const fetchTopTracks = async (accessToken) => {
            
            try {
                const result = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=5', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    method: 'GET',
                });

                

                if (!result.ok) {
                    throw new Error(`Failed to get top tracks: ${result.status} - ${result.statusText}`);
                }

                const { items } = await result.json();
                setTopTracks(items);
            } catch (error) {
                console.error("Error fetching top tracks:", error);
            }
        };

        const renderTopTracks = () => {
            return topTracks.map(({ name, album }, index) => (
                <div key={index}>
                    <img className='trackImage' src={album.images[0].url} alt={`Album cover for ${name}`} />
                </div>
            ));
        };

        return (
            <>
                <h1>Hej min guys</h1>
                {renderTopTracks()}
            </>
        )
    }

    export default Dashboard;
