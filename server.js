// Backend Server for D-ID and ElevenLabs API (Node.js)
// This solves the CORS problem

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const aws4 = require('aws4');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// ============================================
// إعدادات D-ID و ElevenLabs API
// ============================================

// 1. D-ID API Key - احصل عليه من: https://studio.d-id.com/settings/api
const DID_API_KEY = 'bWFiZGVsbmFzZXIxNzE3QGdtYWlsLmNvbQ:CZjkw80kd5V00wgq3G8-E';

// 2. D-ID Presenter ID - يمكنك استخدام:
//    - Presenter ID (مثل: amy-jcwCkr1grs)
//    - أو Source URL مباشرة (رابط صورة)
//    - للحصول على Presenter ID: افتح get-did-presenters.html
const DID_PRESENTER_ID = 'amy-jcwCkr1grs';
const DID_SOURCE_URL = 'https://i.postimg.cc/LXjJtfd8/5.jpg'; // رابط الصورة المباشر

// 3. ElevenLabs API Key - احصل عليه من: https://elevenlabs.io/app/settings/api-keys
const ELEVENLABS_API_KEY = 'sk_19d4ad770927b883687d0496df820056cc95bafb73b6a0a4';

// 4. ElevenLabs Voice ID - احصل عليه من: https://elevenlabs.io/app/voices
const ELEVENLABS_VOICE_ID = 's83SAGdFTflAwJcAV81K';

// Route to generate audio using ElevenLabs
app.post('/api/generate-audio', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'النص مطلوب' });
        }
        
        console.log('=== ElevenLabs API Request ===');
        console.log('Text length:', text.length);
        console.log('Voice ID:', ELEVENLABS_VOICE_ID);
        
        // Generate audio using ElevenLabs
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API Error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'فشل إنشاء الصوت',
                message: errorText
            });
        }
        
        // Get audio URL or return audio data
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL ? 'blob:' : null;
        
        // For now, we'll need to save it or return it as base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        
        res.json({
            success: true,
            audio_base64: base64Audio,
            audio_format: 'mp3'
        });
        
    } catch (error) {
        console.error('Error generating audio:', error);
        res.status(500).json({
            error: 'خطأ في إنشاء الصوت',
            message: error.message
        });
    }
});

// Route to generate video using D-ID
app.post('/api/generate-video', async (req, res) => {
    try {
        const { text, audio_url } = req.body;
        
        if (!text && !audio_url) {
            return res.status(400).json({ error: 'النص أو رابط الصوت مطلوب' });
        }
        
        console.log('=== D-ID API Request ===');
        console.log('Text:', text ? text.substring(0, 100) : 'N/A');
        console.log('Audio URL:', audio_url ? 'Provided' : 'Will generate');
        console.log('Presenter ID:', DID_PRESENTER_ID);
        console.log('Voice ID:', ELEVENLABS_VOICE_ID);
        console.log('API Key (first 20 chars):', DID_API_KEY.substring(0, 20) + '...');
        
        // If no audio URL provided, generate it first using ElevenLabs
        let finalAudioUrl = audio_url;
        
        if (!finalAudioUrl && text) {
            try {
                const audioResponse = await fetch(`http://localhost:${PORT}/api/generate-audio`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text })
                });
                
                if (audioResponse.ok) {
                    const audioData = await audioResponse.json();
                    // For D-ID, we need to upload the audio first or use a different approach
                    // For now, we'll use text-to-speech directly in D-ID
                }
            } catch (e) {
                console.log('Audio generation skipped, using text directly');
            }
        }
        
        // Create video using D-ID
        // D-ID API uses AWS Signature V4 for authentication
        // The API key format is access_key:secret_key (AWS credentials)
        const [awsAccessKey, awsSecretKey] = DID_API_KEY.split(':');
        
        // Function to create AWS Signature V4 headers
        const createAWSSignedHeaders = (requestBody) => {
            const bodyString = JSON.stringify(requestBody);
            const requestOptions = {
                host: 'api.d-id.com',
                path: '/talks',
                method: 'POST',
                service: 'execute-api',
                region: 'us-east-1',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(bodyString)
                },
                body: bodyString
            };
            
            const signed = aws4.sign(requestOptions, {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            });
            
            return signed.headers;
        };
        
        // Try different auth methods
        const authMethods = [
            // Method 1: AWS Signature V4 (correct method)
            (body) => createAWSSignedHeaders(body),
            // Method 2: Basic Auth
            () => ({
                'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
            }),
            // Method 3: X-API-Key
            () => ({
                'X-API-Key': DID_API_KEY
            }),
            // Method 4: Bearer
            () => ({
                'Authorization': `Bearer ${DID_API_KEY}`
            })
        ];
        
        // Try different request formats for D-ID API
        const requestBodies = [
            // Format 1: Standard format with source_url
            {
                source_url: DID_SOURCE_URL || `https://d-id-public-bucket.s3.amazonaws.com/${DID_PRESENTER_ID}.jpg`,
                script: {
                    type: 'text',
                    input: text || 'Hello',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: ELEVENLABS_VOICE_ID,
                        voice_config: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    }
                },
                config: {
                    result_format: 'mp4'
                }
            },
            // Format 2: Without voice_config
            {
                source_url: DID_SOURCE_URL || `https://d-id-public-bucket.s3.amazonaws.com/${DID_PRESENTER_ID}.jpg`,
                script: {
                    type: 'text',
                    input: text || 'Hello',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: ELEVENLABS_VOICE_ID
                    }
                },
                config: {
                    result_format: 'mp4'
                }
            },
            // Format 3: Using presenter_id directly (if supported)
            {
                source_url: `https://d-id-public-bucket.s3.amazonaws.com/${DID_PRESENTER_ID}.jpg`,
                script: {
                    type: 'text',
                    input: text || 'Hello',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: ELEVENLABS_VOICE_ID
                    }
                }
            }
        ];
        
        let lastError = null;
        
        // Try all combinations of auth methods and request formats
        for (let authIndex = 0; authIndex < authMethods.length; authIndex++) {
            for (let formatIndex = 0; formatIndex < requestBodies.length; formatIndex++) {
                const requestBody = requestBodies[formatIndex];
                
                console.log(`\n=== D-ID API Request (Auth ${authIndex + 1}, Format ${formatIndex + 1}) ===`);
                console.log('Text length:', text ? text.length : 0);
                console.log('Source URL:', requestBody.source_url);
                console.log('Voice ID:', ELEVENLABS_VOICE_ID);
                console.log('Auth Method:', authIndex + 1);
                console.log('Request Body:', JSON.stringify(requestBody, null, 2));
                
                try {
                    // Get auth headers based on method
                    const authHeaders = authMethods[authIndex](requestBody);
                    const headers = {
                        'Content-Type': 'application/json',
                        ...authHeaders
                    };
                    
                    console.log('Headers:', JSON.stringify(Object.keys(headers), null, 2));
                    
                    const response = await fetch('https://api.d-id.com/talks', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody)
                    });
                
                const responseText = await response.text();
                let responseData;
                
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    responseData = { raw: responseText };
                }
                
                console.log('D-ID Response Status:', response.status);
                console.log('D-ID Response:', JSON.stringify(responseData, null, 2));
                
                    if (response.ok && responseData.id) {
                        // Success!
                        return res.json({
                            success: true,
                            video_id: responseData.id,
                            status_url: responseData.status_url || `https://api.d-id.com/talks/${responseData.id}`,
                            data: responseData,
                            auth_used: authIndex + 1,
                            format_used: formatIndex + 1
                        });
                    } else if (response.status === 401 || response.status === 403) {
                        // Auth error - try next auth method
                        console.log(`Auth ${authIndex + 1} failed, trying next auth method...`);
                        break; // Break inner loop, try next auth method
                    } else if (response.status === 500 && formatIndex < requestBodies.length - 1) {
                        // Internal Server Error - try next format with same auth
                        console.log(`Format ${formatIndex + 1} failed with 500, trying next format...`);
                        continue;
                    } else if (response.status === 500 && authIndex < authMethods.length - 1) {
                        // All formats failed with this auth, try next auth
                        lastError = {
                            auth: authIndex + 1,
                            format: formatIndex + 1,
                            status: response.status,
                            error: responseData.error || responseData.message || responseData.description,
                            data: responseData
                        };
                        break; // Break inner loop, try next auth method
                    } else {
                        // Other error or last attempt
                        return res.status(response.status || 500).json({
                            success: false,
                            error: 'فشل إنشاء الفيديو',
                            message: responseData.error || responseData.message || responseData.description || responseText,
                            details: responseData,
                            status: response.status,
                            auth_used: authIndex + 1,
                            format_used: formatIndex + 1
                        });
                    }
                } catch (error) {
                    console.log(`Auth ${authIndex + 1}, Format ${formatIndex + 1} error:`, error.message);
                    if (authIndex === authMethods.length - 1 && formatIndex === requestBodies.length - 1) {
                        // Last attempt
                        return res.status(500).json({
                            success: false,
                            error: 'فشل إنشاء الفيديو',
                            message: error.message
                        });
                    }
                    continue;
                }
            }
        }
        
        // All formats failed
        console.error('All D-ID API formats failed');
        return res.status(500).json({
            success: false,
            error: 'فشل إنشاء الفيديو',
            message: 'جميع صيغ الطلب فشلت',
            last_error: lastError
        });
        
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({
            error: 'خطأ في إنشاء الفيديو',
            message: error.message
        });
    }
});

// Route to check video status (D-ID)
app.get('/api/video-status/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const [awsAccessKey, awsSecretKey] = DID_API_KEY.split(':');
        
        // Create AWS Signature V4 headers for GET request
        const requestOptions = {
            host: 'api.d-id.com',
            path: `/talks/${videoId}`,
            method: 'GET',
            service: 'execute-api',
            region: 'us-east-1',
            headers: {}
        };
        
        const signed = aws4.sign(requestOptions, {
            accessKeyId: awsAccessKey,
            secretAccessKey: awsSecretKey
        });
        
        const response = await fetch(`https://api.d-id.com/talks/${videoId}`, {
            method: 'GET',
            headers: signed.headers
        });
        
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response:', responseText);
            return res.status(500).json({
                error: 'خطأ في تحليل الرد من D-ID API',
                message: responseText.substring(0, 200)
            });
        }
        
        if (!response.ok) {
            return res.status(response.status).json({
                error: 'خطأ من D-ID API',
                message: data.error || data.message || responseText
            });
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            error: 'خطأ في التحقق من حالة الفيديو',
            message: error.message
        });
    }
});

// Route to get D-ID presenters (to avoid CORS)
app.get('/api/did/presenters', async (req, res) => {
    try {
        if (!DID_API_KEY || DID_API_KEY === 'YOUR_DID_API_KEY_HERE') {
            return res.status(400).json({
                error: 'يرجى تحديث D-ID API Key في server.js أولاً'
            });
        }
        
        const response = await fetch('https://api.d-id.com/presenters', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
            }
        });
        
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response:', responseText);
            return res.status(500).json({
                error: 'خطأ في تحليل الرد من D-ID API',
                message: responseText.substring(0, 200)
            });
        }
        
        if (!response.ok) {
            return res.status(response.status).json({
                error: 'خطأ من D-ID API',
                message: data.error || data.message || responseText
            });
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('Error getting presenters:', error);
        res.status(500).json({
            error: 'خطأ في جلب Presenters',
            message: error.message
        });
    }
});

// Route to create D-ID presenter (to avoid CORS)
app.post('/api/did/presenters', async (req, res) => {
    try {
        const { source_url } = req.body;
        
        if (!DID_API_KEY || DID_API_KEY === 'YOUR_DID_API_KEY_HERE') {
            return res.status(400).json({
                error: 'يرجى تحديث D-ID API Key في server.js أولاً'
            });
        }
        
        if (!source_url) {
            return res.status(400).json({
                error: 'رابط الصورة مطلوب'
            });
        }
        
        const response = await fetch('https://api.d-id.com/presenters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
            },
            body: JSON.stringify({
                source_url: source_url
            })
        });
        
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response:', responseText);
            return res.status(500).json({
                error: 'خطأ في تحليل الرد من D-ID API',
                message: responseText.substring(0, 200)
            });
        }
        
        if (!response.ok) {
            return res.status(response.status).json({
                error: 'خطأ من D-ID API',
                message: data.error || data.message || responseText
            });
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('Error creating presenter:', error);
        res.status(500).json({
            error: 'خطأ في إنشاء Presenter',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Open http://localhost:${PORT} in your browser`);
    console.log(`\n⚠️  Important: Update API keys in this file before using!`);
});

