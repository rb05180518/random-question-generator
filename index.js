// 默认题目
const defaultQuestions = [
	"1. 英文自我介绍",
	"2. 中文自我介绍",
	"3. What are your hobbies?",
	"4. What do you do in your spare time/free time?",
	"5. What kind of personality do you think you have?",
	"6. What is your greatest strength?",
	"7. What is your greatest weakness/shortcoming/defect/drawback?",
	"8. What has been your greatest achievement/accomplishment?",
	"9. 说说值传递和引用传递？",
	"10. 重载和重写的区别？子类可以重载父类的方法吗？",
	"11. 什么是栈内存？什么是堆内存？有什么区别？",
	"12. 封装，继承，多态",
	"13. Python语言",
	"14. TCP/IP 按层次分为",
	"15. 主要的网络设备",
	"16. TCP三次握手？",
	"17. 操作系统？",
	"18. 如何理解操作系统的并发？",
	"19. 内核态与用户态？",
	"20. 进程与线程？",
	"21. 死锁是怎么产生的？怎么解决死锁的问题？",
	"22. 中断？",
	"23. 虚拟内存？",
	"24. 为什么选择考研？/ 为什么工作一年之后又选择考研？/ 为什么考研到我们学校？",
	"25. 在蚂蚁集团数字马力主要做什么工作？",
	"26. 你在高中开发的软件是什么？",
	"27. 这个小程序是做什么的？",
	"28. 小程序广告宣传的方式？",
	"29. Why choose to take the postgraduate entrance examination?",
	"30. What is the main job of Digital Engine at Ant Group?",
	"31. What software did you develop in high school?",
	"32. What does this mini program do?",
	"33. How to promote mini program advertising?",
	"34. 爱好？",
	"35. 空闲时间做什么？",
	"36. 优点？",
	"37. 缺点？",
	"38. 成就？",
	"39. 性格？",
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
	console.log(111);
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

	console.log(222);
	// 按钮状态
	isQuestionGenerated = true;
	document.getElementById("generate-button").disabled = true;
	document.getElementById("add-to-memorized").disabled = false;
	document.getElementById("add-to-unfamiliar").disabled = false;
	
	console.log(document.getElementById("generate-button").disabled);
	console.log(document.getElementById("add-to-memorized").disabled);
	console.log(document.getElementById("add-to-unfamiliar").disabled);
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
document.getElementById("repeat-icon").addEventListener("click", function() {
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

// 按键事件开关状态
let keyboardEnabled = true;

// 当前题目是否已分类
let isQuestionClassified = false;

// 监听按键事件
document.addEventListener("keydown", (event) => {
  if (!keyboardEnabled) return; // 如果开关关闭，不执行按键事件

  switch (event.key) {
    case "1":
      if (!isQuestionGenerated || isQuestionClassified) {
        generateQuestion();
        isQuestionClassified = false; // 重置分类状态
      }
      break;
    case "2":
      if (isQuestionGenerated && !isQuestionClassified) {
        addToMemorized();
        isQuestionClassified = true; // 标记题目已分类
      }
      break;
    case "3":
      if (isQuestionGenerated && !isQuestionClassified) {
        addToUnfamiliar();
        isQuestionClassified = true; // 标记题目已分类
      }
      break;
    default:
      break;
  }
});

// 监听开关状态变化
document.getElementById("keyboard-switch").addEventListener("change", (event) => {
  keyboardEnabled = event.target.checked;
  showAlert("提示", `按键功能已${keyboardEnabled ? "开启" : "关闭"}`, "info");
});


document.getElementById("question").addEventListener("click", () => {
	if (!isLooping) playQuestion();
});

// 页面加载
loadQuestions();
resetQuestionState();
document.getElementById("remaining-count").textContent = questions.length;
