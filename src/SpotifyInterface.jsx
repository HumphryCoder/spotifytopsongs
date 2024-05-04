import React, {useState, useEffect} from 'react';
import './App.css';
import logo from './logo.png';

const clientId = "6e3a0b362aba4ea595706af76163c25a";


function SpotifyInterface({ onLogout }) {
  const [display_name, setDisplayName] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top tracks:", error);
    }
  };

  const checkAccessToken = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const verifier = localStorage.getItem("verifier");
          const accessToken = await getAccessToken(clientId, code, verifier, 'user-top-read');
          const profile = await fetchProfile(accessToken);
          populateUI(profile);
          await fetchTopTracks(accessToken);
        } else {
          redirectToAuthCodeFlow(clientId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      const profile = await fetchProfile(accessToken);
      populateUI(profile);
      await fetchTopTracks(accessToken);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
  localStorage.removeItem("verifier");
  setDisplayName('');
  onLogout();

  window.location.replace(window.location.origin + window.location.pathname);
  };

 

  useEffect(() => {
    checkAccessToken();

  }, [clientId, onLogout]);
 

  const redirectToAuthCodeFlow = async (clientId) => {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
  
    localStorage.setItem("verifier", verifier);
  
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-top-read"); 
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);
  
    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

const getAccessToken = async (clientId, code) => {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
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

   
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    return access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
   
  }
};


const fetchProfile = async (token) => {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      },
  });

  if (!result.ok) {
      throw new Error(`Failed to fetch profile: ${result.status} - ${result.statusText}`);
  }

  return await result.json();
}

const populateUI = (profile) => {
  setDisplayName(profile.display_name);
};

const renderTopTracks = () => {
  return topTracks.map(({ name, album }, index) => (
    <div key={index}>
      <img className='trackImage' src={album.images[0].url} alt={`Album cover for ${name}`} />
    </div>
  ));
};

return (

        <div id="app">

          <div className='navbar'>
            <img src={logo} alt='Logo' className='logo'/>
            <ul>
              <li>HOME</li>
              <li>TOP ARTISTS</li>
              <li><button onClick={handleLogout} className="logout">SIGN OUT</button></li>
            </ul>
          </div>
          <div className='trackImages'>
            {renderTopTracks()}
          </div>
        </div>
 
);
}

export default SpotifyInterface;
