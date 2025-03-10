// 默认题目
const defaultQuestions = [
  "研究生期间的计划？",
  "Could you describe your plans for the postgraduate study?",
  "职业规划/毕业五年后的规划?",
  "What would you be doing in five years from now?",
  "介绍你的大学？",
  "Would you like to say something about your university?",
  "冯诺依曼架构？",
  "计算机组成原理中的存储系统？",
  "计算机组成原理中的中央处理器（CPU）？",
  "计算机组成原理中的指令系统？",
    "什么是树结构？",
    "What is tree structure?",
    "对机器学习的认识？",
    "What is your understanding of machine learning?",
    "对计算机视觉的认识？",
    "What is your understanding of computer vision?"
];

// 统一调整所有提示框样式
function showAlert(title, text, icon) {
  Swal.fire({
    title,
    text,
    icon,
    width: 400,
    customClass: {
      title: "swal2-title-small",
      htmlContainer: "swal2-content-small",
    },
  });
}

// 从 localStorage 中读取用户添加的题目
let userQuestions = JSON.parse(localStorage.getItem("userQuestions")) || [];
let fetchedQuestions =
  JSON.parse(localStorage.getItem("fetchedQuestions")) || [];
let memorizedQuestions =
  JSON.parse(localStorage.getItem("memorizedQuestions")) || [];
let unfamiliarQuestions =
  JSON.parse(localStorage.getItem("unfamiliarQuestions")) || [];
let currentQuestion = "";
let isLooping = false;
let utterance = null;
let autoPlayEnabled = true;
let isQuestionGenerated = false;

// 合并题目
let questions = [...defaultQuestions, ...userQuestions].filter(
  (q) => !fetchedQuestions.includes(q)
);

// 初始化题目列表
function loadQuestions() {
  const memorizedList = document.getElementById("memorized-questions");
  const unfamiliarList = document.getElementById("unfamiliar-questions");
  memorizedList.innerHTML = "";
  unfamiliarList.innerHTML = "";

  memorizedQuestions.forEach((question) => {
    const li = document.createElement("li");
    li.textContent = question;

    memorizedList.appendChild(li);
  });

  unfamiliarQuestions.forEach((question) => {
    const li = document.createElement("li");
    li.textContent = question;
    unfamiliarList.appendChild(li);
  });
}

// 清空题目
function clearAllQuestions() {
  fetchedQuestions = [];
  memorizedQuestions = [];
  unfamiliarQuestions = [];
  localStorage.removeItem("fetchedQuestions");
  localStorage.removeItem("memorizedQuestions");
  localStorage.removeItem("unfamiliarQuestions");
  loadQuestions();
  questions = [...defaultQuestions, ...userQuestions];
  document.getElementById("remaining-count").textContent = questions.length;
  showAlert("已清空", "所有题目已重置", "success");
}

// 生成随机题目
function generateQuestion() {
  if (questions.length === 0) {
    showAlert("提示", "所有题目已显示完毕！", "warning");
    return;
  }
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  document.getElementById("question").textContent = currentQuestion;
  questions.splice(randomIndex, 1);
  document.getElementById("remaining-count").textContent = questions.length;

  // 更新 localStorage
  fetchedQuestions.push(currentQuestion);
  localStorage.setItem("fetchedQuestions", JSON.stringify(fetchedQuestions));

  // 模糊处理英文题目
  const questionElement = document.getElementById("question");
  const textWithoutNumber = currentQuestion.replace(/^\d+\.\s*/, "");
  questionElement.classList.toggle(
    "blur",
    /^[a-zA-Z\s\?\？\.\/\,\!\'\-\"]+$/.test(textWithoutNumber)
  );

  // 自动播放
  if (autoPlayEnabled) playQuestion();

  // 按钮状态
  isQuestionGenerated = true;
  document.getElementById("generate-button").disabled = true;
  document.getElementById("add-to-memorized").disabled = false;
  document.getElementById("add-to-unfamiliar").disabled = false;
}

// 添加到背诵区 (修复页面跳动)
function addToMemorized() {
  const question = document.getElementById("question").textContent;
  if (question === "点击获取一个随机题目") return;

  memorizedQuestions.unshift(question);
  localStorage.setItem(
    "memorizedQuestions",
    JSON.stringify(memorizedQuestions)
  );

  const li = document.createElement("li");
  li.textContent = question;
  const list = document.getElementById("memorized-questions");
  list.insertBefore(li, list.firstChild);

  resetQuestionState();
  showAlert("成功", "题目已添加到背诵区！", "success");
}

// 添加到不熟区 (修复页面跳动)
function addToUnfamiliar() {
  const question = document.getElementById("question").textContent;
  if (question === "点击获取一个随机题目") return;

  unfamiliarQuestions.unshift(question);
  localStorage.setItem(
    "unfamiliarQuestions",
    JSON.stringify(unfamiliarQuestions)
  );

  const li = document.createElement("li");
  li.textContent = question;
  const list = document.getElementById("unfamiliar-questions");
  list.insertBefore(li, list.firstChild);

  resetQuestionState();
  showAlert("成功", "题目已添加到不熟区！", "success");
}

// 添加新题目
function addNewQuestion() {
  const input = document.getElementById("new-question-input");
  const newQuestion = input.value.trim();

  if (!newQuestion) {
    showAlert("警告", "请输入有效的题目！", "warning");
    return;
  }

  if ([...defaultQuestions, ...userQuestions].includes(newQuestion)) {
    showAlert("警告", "题目已存在！", "error");
    return;
  }

  userQuestions.push(newQuestion);
  localStorage.setItem("userQuestions", JSON.stringify(userQuestions));
  questions.push(newQuestion);
  document.getElementById("remaining-count").textContent = questions.length;
  input.value = "";
  showAlert("成功", "题目添加成功！", "success");
}

// 其他辅助函数
function resetQuestionState() {
  isQuestionGenerated = false;
  document.getElementById("generate-button").disabled = false;
  document.getElementById("add-to-memorized").disabled = true;
  document.getElementById("add-to-unfamiliar").disabled = true;
}

function playQuestion() {
  const text =
    currentQuestion || document.getElementById("question").textContent;
  const textWithoutNumber = text.replace(/^\d+\.\s*/, "");
  const isChinese = /[\u4e00-\u9fa5]/.test(textWithoutNumber);
  utterance = new SpeechSynthesisUtterance(textWithoutNumber);
  utterance.lang = isChinese ? "zh-CN" : "en-US";
  utterance.onend = () => isLooping && window.speechSynthesis.speak(utterance);
  window.speechSynthesis.speak(utterance);
}

function toggleAutoPlay() {
  autoPlayEnabled = !autoPlayEnabled;
  const icon = document.getElementById("auto-play-toggle");
  icon.classList.toggle("fa-volume-up", autoPlayEnabled);
  icon.classList.toggle("fa-volume-mute", !autoPlayEnabled);
  Swal.fire("提示", `自动播放已${autoPlayEnabled ? "开启" : "关闭"}`, "info");
}

// 初始化
document.getElementById("repeat-icon").addEventListener("click", function () {
  isLooping = !isLooping;
  if (isLooping) {
    playQuestion();
    this.classList.replace("fa-play", "fa-pause");
    Swal.fire("提示", "循环播放已开启", "info");
  } else {
    window.speechSynthesis.cancel();
    this.classList.replace("fa-pause", "fa-play");
    Swal.fire("提示", "循环播放已关闭", "info");
  }
});

document.getElementById("question").addEventListener("click", () => {
  if (!isLooping) playQuestion();
});

// 页面加载
loadQuestions();
resetQuestionState();
document.getElementById("remaining-count").textContent = questions.length;
