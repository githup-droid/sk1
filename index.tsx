/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";
import markdownit from "markdown-it";
import { sanitizeHtml } from "safevalues";
import { setElementInnerHtml } from "safevalues/dom";

function initializeApp() {
  const md = markdownit();

  // --- AI Assistant Logic ---
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const fab = document.getElementById("ai-assistant-fab");
  const modalOverlay = document.getElementById("ai-modal-overlay");
  const closeModalBtn = document.getElementById("ai-modal-close-btn");
  const sendBtn = document.getElementById("ai-send-btn");
  const promptInput = document.getElementById(
    "ai-prompt-input",
  ) as HTMLInputElement;
  const chatHistory = document.getElementById("ai-chat-history");
  const loadingIndicator = document.getElementById("ai-loading");

  const toggleModal = (visible: boolean) => {
    if (modalOverlay) {
      if (visible) {
        modalOverlay.classList.add("visible");
      } else {
        modalOverlay.classList.remove("visible");
      }
    }
  };

  fab?.addEventListener("click", () => toggleModal(true));
  closeModalBtn?.addEventListener("click", () => toggleModal(false));
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      toggleModal(false);
    }
  });

  async function generateAiResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Disable input and show loading
    promptInput.value = "";
    promptInput.disabled = true;
    (sendBtn as HTMLButtonElement).disabled = true;
    if (loadingIndicator) loadingIndicator.style.display = "flex";

    // Add user message to chat
    const userMessageDiv = document.createElement("div");
    userMessageDiv.className = "ai-message user";
    setElementInnerHtml(userMessageDiv, sanitizeHtml(prompt));
    chatHistory?.appendChild(userMessageDiv);
    chatHistory?.parentElement?.scrollTo(0, chatHistory.scrollHeight);

    // Prepare assistant message container
    const assistantMessageDiv = document.createElement("div");
    assistantMessageDiv.className = "ai-message assistant";
    chatHistory?.appendChild(assistantMessageDiv);

    try {
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        const formattedHtml = md.render(fullResponse);
        setElementInnerHtml(assistantMessageDiv, sanitizeHtml(formattedHtml));
        chatHistory?.parentElement?.scrollTo(0, chatHistory.scrollHeight);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setElementInnerHtml(
        assistantMessageDiv,
        sanitizeHtml("ขออภัยครับ เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง"),
      );
    } finally {
      // Re-enable input and hide loading
      promptInput.disabled = false;
      (sendBtn as HTMLButtonElement).disabled = false;
      if (loadingIndicator) loadingIndicator.style.display = "none";
      promptInput.focus();
    }
  }

  sendBtn?.addEventListener("click", generateAiResponse);
  promptInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      generateAiResponse();
    }
  });

  // --- UI and Navigation Logic ---
  renderApp();
}

// --- UI and Navigation Logic ---
function renderApp() {
  const appContainer = document.getElementById("app-container")!;
  const mainContent = document.getElementById("main-content")!;

  // Set innerHTML using safevalues
  setElementInnerHtml(
    appContainer,
    sanitizeHtml(
      `<!-- Navigation Bar -->
    <nav class="bg-mediumBlue/80 backdrop-blur-lg border-b border-glass-border-accent/50 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo and Platform Name -->
          <a href="#" class="flex items-center flex-shrink-0">
            <svg class="h-10 w-10 text-neonPink mr-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="5"></circle>
              <path d="M30 35 L70 35 M30 50 L70 50 M30 65 L70 65" stroke="currentColor" stroke-width="5"></path>
              <rect x="40" y="25" width="20" height="50" fill="currentColor" opacity="0.3"></rect>
            </svg>
            <span class="text-base md:text-lg font-semibold font-prompt tracking-wide text-white">โรงเรียนเซกา <span class="block text-xs opacity-80 font-poppins">สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาบึงกาฬ</span></span>
          </a>

          <!-- Mobile Menu Button -->
          <div class="lg:hidden flex items-center ml-2">
            <button id="mobile-menu-button" class="text-gray-300 p-2 rounded-md hover:bg-neonPink/20 focus:outline-none focus:ring-2 ring-neonPink ring-opacity-50">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="fixed inset-0 bg-darkerBlue/90 backdrop-blur-lg z-[100] lg:hidden transform -translate-x-full transition-transform duration-300 ease-in-out">
        <div class="p-8 pt-20 text-center h-full overflow-y-auto">
            <h3 class="text-2xl font-bold text-neonPink mb-8 font-poppins">เมนู</h3>
            <div class="mb-10">
                <h4 class="text-lg font-semibold text-white mb-4 font-poppins">ลิงก์เชื่อมต่อ</h4>
                <ul class="space-y-4">
                    <li><a href="https://classroom.google.com/" target="_blank" class="text-gray-300 hover:text-white text-lg">จัดการชั้นเรียน</a></li>
                    <li><a href="https://sites.google.com/" target="_blank" class="text-gray-300 hover:text-white text-lg">NORA (Google Sites)</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-lg font-semibold text-white mb-4 font-poppins">ตั้งค่า</h4>
                <ul class="space-y-4">
                    <li><a href="#" class="text-gray-300 hover:text-white text-lg">โปรไฟล์ของฉัน</a></li>
                    <li><a href="#" class="text-gray-300 hover:text-white text-lg">การแจ้งเตือน</a></li>
                    <li><a href="#" class="text-gray-300 hover:text-white text-lg">ลักษณะที่ปรากฏ</a></li>
                </ul>
            </div>
        </div>
    </div>`,
    ),
  );

  setElementInnerHtml(
    mainContent,
    sanitizeHtml(`
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Dashboard Content -->
            <div class="lg:col-span-2">
                <div class="mb-8">
                    <h1 class="text-3xl md:text-4xl font-bold text-white font-poppins">แดชบอร์ดหลัก</h1>
                    <p class="text-gray-400 mt-1 font-prompt">ภาพรวมและทางลัดเข้าสู่ระบบ</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Dashboard Card 1 -->
                    <a href="#" class="dashboard-card liquid-glass p-6">
                        <div class="flex items-center mb-4">
                            <div class="glass-icon-container p-3 mr-4">
                                <i class="fa-solid fa-users text-2xl text-neonPink"></i>
                            </div>
                            <h2 class="text-lg font-semibold text-white font-poppins">จัดการข้อมูลนักเรียน</h2>
                        </div>
                        <p class="text-gray-400 text-sm">เพิ่ม ลบ และแก้ไขข้อมูลส่วนตัวและข้อมูลการศึกษาของนักเรียน</p>
                    </a>
                    <!-- Dashboard Card 2 -->
                    <a href="#" class="dashboard-card liquid-glass p-6">
                        <div class="flex items-center mb-4">
                            <div class="glass-icon-container p-3 mr-4">
                                <i class="fa-solid fa-chart-pie text-2xl text-neonPink"></i>
                            </div>
                            <h2 class="text-lg font-semibold text-white font-poppins">รายงานและสถิติ</h2>
                        </div>
                        <p class="text-gray-400 text-sm">ดูและส่งออกรายงานผลการเรียน สถิติการเข้าเรียน และข้อมูลภาพรวม</p>
                    </a>
                    <!-- Dashboard Card 3 -->
                    <a href="#" class="dashboard-card liquid-glass p-6">
                        <div class="flex items-center mb-4">
                            <div class="glass-icon-container p-3 mr-4">
                                <i class="fa-solid fa-calendar-days text-2xl text-neonPink"></i>
                            </div>
                            <h2 class="text-lg font-semibold text-white font-poppins">ตารางเรียนและกิจกรรม</h2>
                        </div>
                        <p class="text-gray-400 text-sm">จัดการตารางสอน ตารางสอบ และดูกิจกรรมต่างๆ ของโรงเรียน</p>
                    </a>
                    <!-- Dashboard Card 4 -->
                    <a href="#" class="dashboard-card liquid-glass p-6">
                        <div class="flex items-center mb-4">
                            <div class="glass-icon-container p-3 mr-4">
                                <i class="fa-solid fa-bullhorn text-2xl text-neonPink"></i>
                            </div>
                            <h2 class="text-lg font-semibold text-white font-poppins">ประกาศ</h2>
                        </div>
                        <p class="text-gray-400 text-sm">ติดตามข่าวสารและประกาศสำคัญจากทางโรงเรียน</p>
                    </a>
                </div>
            </div>
            <!-- Sidebar -->
            <aside class="lg:col-span-1">
                <div class="sticky top-28">
                    <div class="liquid-glass p-6 mb-8">
                        <h3 class="text-lg font-semibold text-white font-poppins mb-4 border-b border-glass-border pb-3">ลิงก์เชื่อมต่อ</h3>
                        <ul class="space-y-3">
                            <li><a href="https://classroom.google.com/" target="_blank" class="sidebar-link"><i class="fa-solid fa-chalkboard-user mr-3 w-5 text-center"></i>จัดการชั้นเรียน</a></li>
                            <li><a href="https://sites.google.com/" target="_blank" class="sidebar-link"><i class="fa-solid fa-globe mr-3 w-5 text-center"></i>NORA (Google Sites)</a></li>
                        </ul>
                    </div>
                    <div class="liquid-glass p-6">
                        <h3 class="text-lg font-semibold text-white font-poppins mb-4 border-b border-glass-border pb-3">ตั้งค่า</h3>
                        <ul class="space-y-3">
                            <li><a href="#" class="sidebar-link"><i class="fa-solid fa-user-gear mr-3 w-5 text-center"></i>โปรไฟล์ของฉัน</a></li>
                            <li><a href="#" class="sidebar-link"><i class="fa-solid fa-bell mr-3 w-5 text-center"></i>การแจ้งเตือน</a></li>
                            <li><a href="#" class="sidebar-link"><i class="fa-solid fa-palette mr-3 w-5 text-center"></i>ลักษณะที่ปรากฏ</a></li>
                        </ul>
                    </div>
                </div>
            </aside>
        </div>
    </div>`),
  );

  // --- Mobile Menu Logic ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("-translate-x-full");
    });

    // Example of adding a close button dynamically
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.className = "absolute top-5 right-5 text-4xl text-white";
    closeButton.onclick = () => mobileMenu.classList.add("-translate-x-full");
    mobileMenu.appendChild(closeButton);
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);

export {};
