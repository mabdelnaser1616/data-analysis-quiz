// API Keys
// ⚠️ مهم: أضف ChatGPT API Key هنا بعد رفع المشروع على GitHub
// احصل على API Key من: https://platform.openai.com/api-keys
const CHATGPT_API_KEY = 'YOUR_CHATGPT_API_KEY_HERE';
// Note: D-ID and ElevenLabs API keys are configured in server.js (or Vercel Environment Variables)

// Questions about Data Analysis
const questions = [
    {
        id: 1,
        question: "ما هو تعريف تحليل البيانات (Data Analysis)؟",
        correctAnswer: "تحليل البيانات هو عملية فحص وتنظيف وتحويل وبناء نماذج للبيانات بهدف اكتشاف معلومات مفيدة واتخاذ قرارات مدروسة."
    },
    {
        id: 2,
        question: "ما هي أنواع البيانات الرئيسية في التحليل؟",
        correctAnswer: "البيانات النوعية (Qualitative) والبيانات الكمية (Quantitative)، والبيانات المنفصلة (Discrete) والبيانات المستمرة (Continuous)."
    },
    {
        id: 3,
        question: "ما هو الفرق بين المتوسط (Mean) والوسيط (Median)؟",
        correctAnswer: "المتوسط هو مجموع القيم مقسوم على عددها، بينما الوسيط هو القيمة الوسطى عند ترتيب البيانات تصاعدياً."
    },
    {
        id: 4,
        question: "ما هو الانحراف المعياري (Standard Deviation)؟",
        correctAnswer: "الانحراف المعياري هو مقياس لمدى انتشار البيانات حول المتوسط، وكلما زاد الانحراف المعياري زادت تباين البيانات."
    },
    {
        id: 5,
        question: "ما هي القيمة الشاذة (Outlier) في البيانات؟",
        correctAnswer: "القيمة الشاذة هي قيمة تختلف بشكل كبير عن باقي القيم في مجموعة البيانات وقد تؤثر على نتائج التحليل."
    },
    {
        id: 6,
        question: "ما هو الهدف من استخدام الرسوم البيانية في تحليل البيانات؟",
        correctAnswer: "الرسوم البيانية تساعد في تصور البيانات واكتشاف الأنماط والعلاقات والاتجاهات التي قد لا تكون واضحة في البيانات الخام."
    },
    {
        id: 7,
        question: "ما هو الفرق بين الارتباط (Correlation) والسببية (Causation)؟",
        correctAnswer: "الارتباط يعني وجود علاقة بين متغيرين، بينما السببية تعني أن متغير واحد يسبب تغييراً في متغير آخر. الارتباط لا يعني السببية."
    },
    {
        id: 8,
        question: "ما هي أهمية تنظيف البيانات (Data Cleaning)؟",
        correctAnswer: "تنظيف البيانات مهم لإزالة الأخطاء والقيم المفقودة والتكرارات لضمان دقة نتائج التحليل وموثوقيتها."
    },
    {
        id: 9,
        question: "ما هو التحليل التنبؤي (Predictive Analytics)؟",
        correctAnswer: "التحليل التنبؤي هو استخدام البيانات والنماذج الإحصائية لتوقع الأحداث المستقبلية والاتجاهات بناءً على البيانات التاريخية."
    },
    {
        id: 10,
        question: "ما هي أهمية التحقق من صحة البيانات (Data Validation)؟",
        correctAnswer: "التحقق من صحة البيانات يضمن أن البيانات دقيقة ومكتملة ومتسقة قبل استخدامها في التحليل، مما يمنع الأخطاء والنتائج الخاطئة."
    }
];

let currentQuestionIndex = 0;
let answeredQuestions = 0;
let currentResponse = '';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderQuestions();
    updateProgress();
});

// Render all questions
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.style.animationDelay = `${index * 0.1}s`;
        
        questionCard.innerHTML = `
            <div class="question-number">سؤال ${q.id}</div>
            <div class="question-text">${q.question}</div>
            <input type="text" class="answer-input" id="answer-${q.id}" placeholder="اكتب إجابتك هنا...">
            <button class="check-btn" onclick="checkAnswer(${q.id})">✓ تحقق من الإجابة</button>
        `;
        
        container.appendChild(questionCard);
    });
}

// Update progress bar
function updateProgress() {
    const progress = (answeredQuestions / questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Check answer using ChatGPT API
async function checkAnswer(questionId) {
    const question = questions.find(q => q.id === questionId);
    const answerInput = document.getElementById(`answer-${questionId}`);
    const checkBtn = answerInput.nextElementSibling;
    const userAnswer = answerInput.value.trim();
    
    if (!userAnswer) {
        alert('يرجى إدخال إجابة أولاً');
        return;
    }
    
    // Disable button and show loading
    checkBtn.disabled = true;
    checkBtn.textContent = 'جاري التحقق...';
    
    try {
        // Call ChatGPT API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHATGPT_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مساعد متخصص في تقييم إجابات الطلاب في مادة تحليل البيانات. قم بتقييم الإجابة بدقة وأخبر الطالب إذا كانت صحيحة أو خاطئة. إذا كانت خاطئة، قدم الإجابة الصحيحة بشكل واضح ومفصل.'
                    },
                    {
                        role: 'user',
                        content: `السؤال: ${question.question}\n\nالإجابة الصحيحة المتوقعة: ${question.correctAnswer}\n\nإجابة الطالب: ${userAnswer}\n\nقم بتقييم إجابة الطالب وأخبره إذا كانت صحيحة أو خاطئة. إذا كانت خاطئة، قدم الإجابة الصحيحة بشكل مفصل.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        const chatResponse = data.choices[0].message.content;
        currentResponse = chatResponse;
        
        // Display response
        displayResponse(chatResponse, questionId);
        
        // Re-enable button
        checkBtn.disabled = false;
        checkBtn.textContent = '✓ تم التحقق';
        
        // Mark as answered
        if (!answerInput.dataset.answered) {
            answeredQuestions++;
            answerInput.dataset.answered = 'true';
            updateProgress();
        }
        
        // Show video button
        document.getElementById('videoBtn').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء التحقق من الإجابة. يرجى المحاولة مرة أخرى.');
        checkBtn.disabled = false;
        checkBtn.textContent = '✓ تحقق من الإجابة';
    }
}

// Display ChatGPT response
function displayResponse(response, questionId) {
    const responseContainer = document.getElementById('chatResponse');
    const responseContent = document.getElementById('responseContent');
    
    responseContainer.style.display = 'block';
    
    // Check if response indicates correct or incorrect
    const isCorrect = response.toLowerCase().includes('صحيح') || 
                     response.toLowerCase().includes('صحيحة') ||
                     response.toLowerCase().includes('ممتاز') ||
                     response.toLowerCase().includes('جيد');
    
    const isIncorrect = response.toLowerCase().includes('خطأ') ||
                       response.toLowerCase().includes('خاطئة') ||
                       response.toLowerCase().includes('غير صحيح');
    
    if (isCorrect && !isIncorrect) {
        responseContent.className = 'response-content correct';
    } else if (isIncorrect) {
        responseContent.className = 'response-content incorrect';
    } else {
        responseContent.className = 'response-content';
    }
    
    responseContent.innerHTML = response.replace(/\n/g, '<br>');
    
    // Scroll to response
    responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Generate video using D-ID API with ElevenLabs voice (through backend to avoid CORS)
async function generateVideo() {
    if (!currentResponse) {
        alert('لا يوجد رد من ChatGPT لتحويله إلى فيديو');
        return;
    }
    
    const videoBtn = document.getElementById('videoBtn');
    const videoContainer = document.getElementById('videoContainer');
    const videoLoading = videoContainer.querySelector('.video-loading');
    const videoResult = document.getElementById('videoResult');
    
    // Show loading
    videoContainer.style.display = 'block';
    videoLoading.style.display = 'block';
    videoResult.style.display = 'none';
    videoBtn.disabled = true;
    videoBtn.textContent = 'جاري الإنشاء...';
    
    // Update loading message
    const loadingMsg = videoLoading.querySelector('.loading-text');
    if (loadingMsg) {
        loadingMsg.textContent = 'جاري إنشاء الفيديو... قد يستغرق بضع دقائق';
    }
    
    try {
        // Use backend server to avoid CORS issues
        // Backend handles D-ID API and ElevenLabs integration
        // Use environment-aware URL (works for both localhost and Vercel)
        const backendUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/generate-video'
            : '/api/generate-video';
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: currentResponse
            })
        });
        
        const result = await response.json();
        
        console.log('Backend Response:', result);
        
        if (!response.ok || !result.success) {
            const errorMsg = result.message || result.error || 'فشل إنشاء الفيديو';
            console.error('Error details:', result);
            throw new Error(errorMsg);
        }
        
        if (result.success) {
            // D-ID returns video_id, we need to poll for status
            if (result.video_id) {
                console.log('تم بدء إنشاء الفيديو!');
                console.log('Video ID:', result.video_id);
                pollVideoStatus(result.video_id);
            } else if (result.data?.id) {
                console.log('تم بدء إنشاء الفيديو!');
                console.log('Video ID:', result.data.id);
                pollVideoStatus(result.data.id);
            } else if (result.data?.video_id) {
                console.log('تم بدء إنشاء الفيديو!');
                console.log('Video ID:', result.data.video_id);
                pollVideoStatus(result.data.video_id);
            } else {
                console.log('Full API response:', result);
                throw new Error('تم استلام رد من API لكن لم يتم العثور على video_id. راجع Console للتفاصيل.');
            }
        } else {
            throw new Error(result.error || 'فشل إنشاء الفيديو');
        }
        
    } catch (error) {
        console.error('Error generating video:', error);
        
        // Check if it's a connection error (backend not running)
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            videoLoading.innerHTML = `
                <div style="text-align: center;">
                    <p style="color: var(--error-color); font-size: 1.1rem; margin-bottom: 1rem;">
                        ⚠️ لا يمكن الاتصال بالخادم
                    </p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        يرجى تشغيل الخادم أولاً:
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                        <strong>الخطوات:</strong><br>
                        1. افتح Terminal في مجلد المشروع<br>
                        2. شغّل: <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">npm install</code><br>
                        3. شغّل: <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">npm start</code><br>
                        4. انتظر حتى يظهر "Server running on http://localhost:3000"<br>
                        5. جرب مرة أخرى
                    </p>
                </div>
            `;
        } else {
            // Show detailed error message
            videoLoading.innerHTML = `
                <div style="text-align: center;">
                    <p style="color: var(--error-color); font-size: 1.1rem; margin-bottom: 1rem;">
                        ⚠️ حدث خطأ أثناء إنشاء الفيديو
                    </p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        ${error.message}
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                        <strong>ملاحظات:</strong><br>
                        • تأكد من صحة D-ID API Key في server.js<br>
                        • تأكد من صحة ElevenLabs API Key في server.js<br>
                        • تأكد من صحة Presenter ID و Voice ID<br>
                        • افتح Console (F12) لرؤية تفاصيل الخطأ<br>
                        • تأكد من أن الخادم يعمل (npm start)
                    </p>
                </div>
            `;
        }
    } finally {
        videoBtn.disabled = false;
        videoBtn.textContent = '🎬 تحويل إلى فيديو';
    }
}

// Poll for video status (D-ID through backend)
async function pollVideoStatus(videoId) {
    const videoLoading = document.querySelector('.video-loading');
    const maxAttempts = 60; // D-ID may take longer (3 minutes max)
    let attempts = 0;
    
    const poll = async () => {
        try {
            // Use environment-aware URL
            const statusUrl = window.location.hostname === 'localhost'
                ? `http://localhost:3000/api/video-status/${videoId}`
                : `/api/video-status?videoId=${videoId}`;
            
            const response = await fetch(statusUrl, {
                method: 'GET'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'خطأ غير معروف' }));
                throw new Error(errorData.error || errorData.message || `خطأ ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('Video status check:', data.status, data);
            
            // D-ID response structure - check multiple possible fields for video URL
            const videoUrl = data.result_url || data.result?.url || data.result || data.video_url;
            
            if (data.status === 'done' && videoUrl) {
                // Video is ready!
                displayVideo(videoUrl);
            } else if (data.status === 'error') {
                throw new Error(data.error?.message || data.message || 'فشل إنشاء الفيديو');
            } else if (data.status === 'created' || data.status === 'started' || data.status === 'processing') {
                // Still processing
                if (attempts < maxAttempts) {
                    attempts++;
                    // Update loading message with attempt count
                    const loadingMsg = videoLoading.querySelector('.loading-text');
                    if (loadingMsg) {
                        loadingMsg.textContent = `جاري معالجة الفيديو... قد يستغرق بضع دقائق (${attempts}/${maxAttempts})`;
                    }
                    setTimeout(poll, 3000); // Poll every 3 seconds for D-ID
                } else {
                    throw new Error('انتهى الوقت المحدد لانتظار الفيديو');
                }
            } else if (attempts < maxAttempts) {
                // Unknown status, but keep trying
                attempts++;
                const loadingMsg = videoLoading.querySelector('.loading-text');
                if (loadingMsg) {
                    loadingMsg.textContent = `جاري معالجة الفيديو... (${attempts}/${maxAttempts})`;
                }
                setTimeout(poll, 3000);
            } else {
                throw new Error('انتهى الوقت المحدد لانتظار الفيديو');
            }
        } catch (error) {
            console.error('Error polling video status:', error);
            const videoLoading = document.querySelector('.video-loading');
            videoLoading.innerHTML = `
                <div style="text-align: center;">
                    <p style="color: var(--error-color); font-size: 1.1rem; margin-bottom: 1rem;">
                        ⚠️ حدث خطأ أثناء متابعة حالة الفيديو
                    </p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        ${error.message}
                    </p>
                </div>
            `;
        }
    };
    
    poll();
}

// Display generated video
function displayVideo(videoUrl) {
    const videoLoading = document.querySelector('.video-loading');
    const videoResult = document.getElementById('videoResult');
    const videoBtn = document.getElementById('videoBtn');
    
    videoLoading.style.display = 'none';
    videoResult.style.display = 'block';
    videoBtn.disabled = false;
    videoBtn.textContent = '🎬 تحويل إلى فيديو';
    
    // Use video tag for better compatibility with D-ID video URLs
    videoResult.innerHTML = `
        <video controls autoplay style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
            <source src="${videoUrl}" type="video/mp4">
            متصفحك لا يدعم تشغيل الفيديو.
        </video>
        <div style="margin-top: 1rem;">
            <a href="${videoUrl}" target="_blank" style="display: inline-block; color: var(--primary-color); text-decoration: none; font-weight: 600; transition: all 0.3s ease;">
                📥 فتح الفيديو في نافذة جديدة
            </a>
        </div>
    `;
    
    // Scroll to video
    videoResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display manual video (fallback)
function displayManualVideo() {
    const videoUrl = document.getElementById('manualVideoUrl').value;
    if (!videoUrl) {
        alert('يرجى إدخال رابط الفيديو');
        return;
    }
    displayVideo(videoUrl);
}

// Attach video button event
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('videoBtn').addEventListener('click', generateVideo);
});

