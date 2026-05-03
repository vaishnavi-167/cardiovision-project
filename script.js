// Toggle Views
function showAssessment() {

    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('assessment-view').classList.remove('hidden');
    document.querySelector('.navbar').classList.add('hidden');

    // show form
    document.getElementById('multiStepForm').classList.remove('hidden');

    // IMPORTANT: force step1
    nextStep(1);

    window.scrollTo(0,0);
}

function showHome() {
    // Clear data so the next person starts fresh
    localStorage.removeItem('cardioResults');
    
    // Just redirect. index.html will load its own fresh state.
    window.location.href = "index.html";
}

// Multi-step form navigation
function nextStep(stepNumber) {
    // Hide all form steps
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    // Show current form step
    document.getElementById('step' + stepNumber).classList.add('active');

    // Update Reconstructed Progress Bar state
    document.querySelectorAll('.progbar-item').forEach((item, index) => {
        const itemNum = index + 1;
        item.classList.remove('current', 'completed');

        if (itemNum < stepNumber) {
            item.classList.add('completed');
        } else if (itemNum === stepNumber) {
            item.classList.add('current');
        }
    });
}

// Calculation and rendering results
// 1. Calculation Logic
function calculateRisk() {
    let score = 0;
    const data = {
        name: document.getElementById("userName")?.value || "User",
        age: parseInt(document.getElementById('userAge').value) || 30,
        bp: parseInt(document.getElementById('userBP').value) || 120,
        chol: parseInt(document.getElementById('userChol').value) || 200,
        bmi: parseFloat(document.getElementById('userBMI').value) || 24,
        smoke: document.getElementById('smoke').checked,
        diabetes: document.getElementById('diabetes').checked,
    family: document.getElementById('family').checked,
        gender: document.querySelector('input[name="gender"]:checked')?.value || "unspecified",
        activity: document.getElementById('userActivity').value
    };

    // --- Scoring Logic ---
   // --- Improved Scoring Logic ---

// Age
if (data.age >= 55) score += 25;
else if (data.age >= 45) score += 15;
else if (data.age >= 35) score += 8;

// Blood Pressure
if (data.bp >= 140) score += 25;
else if (data.bp >= 130) score += 15;
else if (data.bp >= 120) score += 5;

// Cholesterol
if (data.chol >= 240) score += 20;
else if (data.chol >= 200) score += 10;

// BMI
if (data.bmi >= 30) score += 20;
else if (data.bmi >= 25) score += 10;

// Smoking
if (data.smoke) score += 20;

// Diabetes
if (data.diabetes) score += 20;

// Family History
if (data.family) score += 10;

// Physical Activity
if (data.activity === "low") score += 8;
else if (data.activity === "moderate") score += 3;
    

    score = Math.min(score, 100); // Max 100%
    renderResults(score, data);
   
    localStorage.setItem('cardioResults', JSON.stringify({ score, data }));

    // 4. REDIRECT to the separate page
    window.location.href = "result.html";
}

// 2. Rendering Logic 
function renderResults(score, data) {
    const name = data.name || "User"; 
    
    const greeting = document.getElementById("userGreeting");
    if (greeting) {
        greeting.innerText = `Hi ${name}, your estimated heart risk is ${score}%`;
    }
    

    const percentDisplay = document.getElementById('riskPercent');
    if (percentDisplay) {
        percentDisplay.innerText = score + "%";
    }

    // 3. Colors determine
    let color, category, badgeClass;
   if (score >= 60)  {
        color = "#e53e3e"; category = "High Risk"; badgeClass = "high-risk";
    } else if (score >= 30) {
        color = "#d69e2e"; category = "Moderate Risk"; badgeClass = "med-risk";
    } else {
        color = "#27ae60"; category = "Low Risk"; badgeClass = "low-risk";
    }

    // 4. Update Circle Progress
  // 4. Update Circle Progress
    const circle = document.getElementById('riskCircleContainer') || document.querySelector('.circular-progress');
    if (circle) {
        circle.style.background = `conic-gradient(${color} ${score * 3.6}deg, #f0f2f5 0deg)`;
    }

    // 5. Update Status Badge & Category Text
    const badge = document.getElementById('riskBadge');
    const categoryText = document.getElementById('riskCategory');
    if (badge) badge.className = `risk-badge ${badgeClass}`;
    if (categoryText) {
        categoryText.innerText = category;
        categoryText.style.color = color; 
    }

    // 6. Data Blocks
    const summaryGrid = document.getElementById('summaryGrid');
    if (summaryGrid) {
        summaryGrid.innerHTML = `
            <div class="data-block"><span>Age</span><strong>${data.age}</strong></div>
            <div class="data-block"><span>BP</span><strong>${data.bp}</strong></div>
            <div class="data-block"><span>Cholesterol</span><strong>${data.chol}</strong></div>
            <div class="data-block"><span>BMI</span><strong>${parseFloat(data.bmi).toFixed(1)}</strong></div>
          <div class="data-block"><span>Smoker</span><strong>${data.smoke ? 'Yes' : 'No'}</strong></div>
<div class="data-block"><span>Diabetes</span><strong>${data.diabetes ? 'Yes' : 'No'}</strong></div>
<div class="data-block"><span>Family History</span><strong>${data.family ? 'Yes' : 'No'}</strong></div>
            <div class="data-block"><span>Activity</span><strong>${data.activity ? (data.activity.charAt(0).toUpperCase() + data.activity.slice(1)) : 'N/A'}</strong></div>
        `;
    }

    // 7. Recommendations
// 7. Recommendations Update
const recs = document.getElementById('recommendationList');
if (recs) {
    recs.innerHTML = "";
    let recommendationsFound = false;

    // A. Smoking - High Priority
    if (data.smoke) {
        recs.innerHTML += `
        <div class="reco-item high-priority">
            <div class="reco-icon">🚭</div>
            <div class="reco-text">
                <strong>Action Required: Smoking</strong>
                <span>Quitting smoking can reduce heart risk by 50% in one year.</span>
            </div>
        </div>`;
        recommendationsFound = true;
    }
    if (data.diabetes) {
    recs.innerHTML += `
    <div class="reco-item high-priority">
        <div class="reco-icon">🩸</div>
        <div class="reco-text">
            <strong>Diabetes Management</strong>
            <span>Maintain blood sugar levels through diet, exercise, and regular medical monitoring.</span>
        </div>
    </div>`;
    recommendationsFound = true;
}
if (data.family) {
    recs.innerHTML += `
    <div class="reco-item medium-priority">
        <div class="reco-icon">❤️</div>
        <div class="reco-text">
            <strong>Genetic Risk Awareness</strong>
            <span>Since heart disease runs in your family, regular health screening is recommended.</span>
        </div>
    </div>`;
    recommendationsFound = true;
}

    // B. Blood Pressure - High Priority
    if (data.bp >= 140) {
        recs.innerHTML += `
        <div class="reco-item high-priority">
            <div class="reco-icon">🩺</div>
            <div class="reco-text">
                <strong>Medical Checkup: Hypertension</strong>
                <span>Monitor BP daily and reduce sodium intake. Consult a doctor.</span>
            </div>
        </div>`;
        recommendationsFound = true;
    }

    // C. Cholesterol - Medium Priority
    if (data.chol >= 240) {
        recs.innerHTML += `
        <div class="reco-item medium-priority">
            <div class="reco-icon">🥗</div>
            <div class="reco-text">
                <strong>Dietary Change: Cholesterol</strong>
                <span>Adopt a low-fat, high-fiber diet. Reduce saturated fats.</span>
            </div>
        </div>`;
        recommendationsFound = true;
    }

    // D. BMI - Medium Priority
    if (data.bmi >= 30) {
        recs.innerHTML += `
        <div class="reco-item medium-priority">
            <div class="reco-icon">⚖️</div>
            <div class="reco-text">
                <strong>Weight Management: BMI</strong>
                <span>Focus on sustainable weight loss through diet and movement.</span>
            </div>
        </div>`;
        recommendationsFound = true;
    }
    if (data.activity === "low") {
    recs.innerHTML += `
    <div class="reco-item medium-priority">
        <div class="reco-icon">🏃</div>
        <div class="reco-text">
            <strong>Increase Physical Activity</strong>
            <span>At least 30 minutes of moderate exercise daily improves heart health.</span>
        </div>
    </div>`;
    recommendationsFound = true;
}

    // E. Default - No Issues
    if (!recommendationsFound) {
        recs.innerHTML = `
        <div class="reco-item healthy-status">
            <div class="reco-icon">✅</div>
            <div class="reco-text">
                <strong>Keep it up!</strong>
                <span>Maintain your current healthy habits and continue regular checkups.</span>
            </div>
        </div>`;
    }
}

const reasons = document.getElementById("riskReasons");

if (reasons) {
    reasons.innerHTML = "";

    if (data.bp >= 140) {
        reasons.innerHTML += "<li>High blood pressure</li>";
    }

    if (data.chol >= 240) {
        reasons.innerHTML += "<li>High cholesterol</li>";
    }

    if (data.smoke) {
        reasons.innerHTML += "<li>Smoking habit</li>";
    }

    if (data.activity === "low") {
        reasons.innerHTML += "<li>Low physical activity</li>";
    }

    if (data.bmi >= 30) {
        reasons.innerHTML += "<li>High BMI (obesity)</li>";
    }

    if (data.diabetes) {
        reasons.innerHTML += "<li>Diabetes</li>";
    }

    if (data.family) {
        reasons.innerHTML += "<li>Family history of heart disease</li>";
    }

    if (reasons.innerHTML === "") {
        reasons.innerHTML = "<li>No major risk factors detected.</li>";
    }

}
}


document.addEventListener('DOMContentLoaded', () => {
   
    const checkResultPage = document.getElementById('riskPercent');
    
    if (checkResultPage) {
        const savedData = localStorage.getItem('cardioResults');
        if (savedData) {
            const { score, data } = JSON.parse(savedData);
            renderResults(score, data);
        }
    }


});
