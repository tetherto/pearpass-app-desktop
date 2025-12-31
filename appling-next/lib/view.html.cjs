const AUTO_LAUNCH = true;
const SLOW_TIMEOUT = 180000; // 3 minutes

// Simple inline SVG for splash - can be replaced with actual PearPass logo
const splashSvg = ``;

// Pear logo SVG
const pearSvg = `<svg width="17" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.61644 0H8.7882V2.1725H7.61644V0Z" fill="#B0D944" />
  <path d="M7.03056 2.86V3.3H5.8588V3.85H10.5458V3.3H9.37408V2.4475H8.20232V2.86H7.03056Z" fill="#B0D944" />
  <path d="M11.7176 4.125H8.20232V4.5375H4.68704V5.5275H11.7176V4.125Z" fill="#B0D944" />
  <path d="M12.8894 5.8025H8.20232V6.215H3.51528V7.205H12.8894V5.8025Z" fill="#B0D944" />
  <path d="M12.8894 7.48H8.20232V7.8925H3.51528V8.8825H12.8894V7.48Z" fill="#B0D944" />
  <path d="M14.0611 9.1575H8.20232V9.57H2.34352V10.56H14.0611V9.1575Z" fill="#B0D944" />
  <path d="M14.0611 10.835H8.20232V11.2475H2.34352V12.2375H14.0611V10.835Z" fill="#B0D944" />
  <path d="M15.2329 12.5125H8.20232V12.925H1.17176V13.915H15.2329V12.5125Z" fill="#B0D944" />
  <path d="M16.4046 14.19H8.20232V14.6025H0V15.5925H16.4046V14.19Z" fill="#B0D944" />
  <path d="M16.4046 15.8675H8.20232V16.28H0V17.27H16.4046V15.8675Z" fill="#B0D944" />
  <path d="M16.4046 17.545H8.20232V17.9575H0V18.9475H16.4046V17.545Z" fill="#B0D944" />
  <path d="M14.0611 19.2225H8.20232V19.635H2.34352V20.625H14.0611V19.2225Z" fill="#B0D944" />
  <path d="M11.7176 20.9H8.20232V21.3125H4.68704V22H11.7176V20.9Z" fill="#B0D944" />
</svg>`;

const html = String.raw;

module.exports = html`
  <style>
    :root {
      --color-white: #ffffff;
      --color-green-400: #33f59a;
      --color-grey-100: #ced3dc;
      --color-grey-500: #30333f;
      --color-grey-800: #151823;
      --color-grey-950: #00020a;
      --color-blue-400: #26d2e8;
      --color-blue-500: #0cb6ce;
      --color-blue-600: #0d91ad;
      --color-blue-950: #0a3342;
      --color-red-300: #ff6c72;
      --color-red-400: #ff1831;
      --color-gradient-background: linear-gradient(
        180deg,
      #687c26 0%,
      #1e2211 100%
      );
    }

    html {
      font-size: 16px;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: red;
    }

    body {
      margin: 0;
      background: var(--color-gradient-background);
      color: var(--color-white);
      font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
        Cantarell, sans-serif;
    }

    img {
      flex: 1;
      padding: 0 100px;
    }

    h1 {
      font-weight: 600;
      font-size: 1.25rem;
      margin: 0;
    }

    p {
      margin: 0;
      font-weight: 400;
      font-size: 0.875rem;
    }

    span {
      font-weight: 400;
      font-size: 0.75rem;
      color: var(--color-grey-100);
    }

    main {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      padding: 0 3.8rem;
      height: 100vh;
    }

    header {
      display: flex;
      align-items: center;
      flex-direction: column;
      text-align: center;
    }

    article {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      width: 100%;
    }

    footer {
      gap: 0.5rem;
      text-align: center;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    button {
      background-color: #9fc131;
      color: var(--color-grey-950);
      font-size: 0.938rem;
      font-weight: 600;
      height: 2.75rem;
      padding: 0 2.5rem;
      border-radius: 3.125rem;
      border: none;
      letter-spacing: -0.02em;
      margin-top: 1.125rem;
      margin-bottom: 3.125rem;
      transition: background-color 0.2s ease;
      white-space: nowrap;
      cursor: pointer;
    }

    button:hover {
      background-color: #b1cb58;
    }

    button:active {
      background-color: #b1cb58;
    }

    button,
    button:focus {
      outline: none;
    }

    button.secondary {
      color: var(--color-blue-400);
      border: 1px solid var(--color-blue-400);
      background-color: transparent;
    }

    button.secondary:hover {
      color: var(--color-blue-400);
      border-color: var(--color-blue-500);
      background-color: transparent;
    }

    .hidden {
      display: none !important;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.125rem;
      margin-bottom: 0;
      width: 100%;
    }

    .button-group button {
      flex: 1;
      min-width: 0;
      margin: 0;
      padding: 0 1rem;
    }

    .message {
      font-size: 0.8rem;
      width: 100%;
      text-align: left;
    }

    .message.error {
      color: var(--color-red-400);
    }

    .status-line {
      display: flex;
      justify-content: space-between;
      align-items: start;
      width: 100%;
      gap: 0.3rem;
      min-height: 1.5rem;
    }

    .status-line .message {
      margin: 0;
      flex: 1;
      text-align: left;
    }

    .stats {
      font-variant-numeric: tabular-nums;
      font-size: 0.8rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.3rem;
      white-space: nowrap;
      margin: 0;
      margin-left: auto;
    }

    .status {
      width: 100%;
      height: 130px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }

    @keyframes indeterminate {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }

    .progress {
      width: 100%;
      height: 6px;
      background-color: var(--color-grey-500);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress > div {
      height: 100%;
      width: 0%;
      border-radius: 4px;
      background-color: var(--color-blue-400);
      animation: none;
    }

    .progress.indeterminate > div {
      width: 25%;
      animation: indeterminate 1.5s ease-in-out infinite;
    }

    .progress.red > div {
      background-color: var(--color-red-400);
    }

    .progress.green > div {
      background-color: var(--color-green-400);
    }

    .progress.complete > div {
      width: 100%;
      animation: none;
      background-color: var(--color-green-400);
    }

    .progress.determinate > div {
      animation: none;
      width: 0%;
    }

    .progress.determinate.transitioning > div {
      transition: width 0.3s ease;
    }
  </style>

  <main>
    <header>${splashSvg}</header>
    <article>
      <h1 id="title">Welcome to PearPass</h1>
      <p id="message">
        Ready to start the installation. This will only take a moment.
      </p>

      <button id="installBtn">Install PearPass</button>

      <div id="status" class="status hidden">
        <div id="progress" class="progress"><div></div></div>
        <div id="statusLine" class="status-line">
          <p id="warning" class="message"></p>
          <p id="stats" class="stats"></p>
        </div>
        <div id="buttonGroup" class="button-group hidden">
          <button id="quitBtn" class="secondary">Quit</button>
          <button id="retryBtn">Retry installation</button>
        </div>
        <button
          id="launchBtn"
          class="hidden"
          style="margin-top: 1.125rem; margin-bottom: 0;"
        >
          Launch PearPass
        </button>
      </div>
    </article>
    <footer>
      ${pearSvg}
      <span>Powered by Pear</span>
    </footer>
  </main>
  <script>
    const SLOW_TIMEOUT = ${SLOW_TIMEOUT};
    const AUTO_LAUNCH = ${AUTO_LAUNCH};

    const elements = {
      title: document.getElementById("title"),
      message: document.getElementById("message"),
      status: document.getElementById("status"),
      progress: document.getElementById("progress"),
      stats: document.getElementById("stats"),
      warning: document.getElementById("warning"),
      buttonGroup: document.getElementById("buttonGroup"),
      installBtn: document.getElementById("installBtn"),
      quitBtn: document.getElementById("quitBtn"),
      retryBtn: document.getElementById("retryBtn"),
      launchBtn: document.getElementById("launchBtn"),
    };

    let timer = null;

    function startTimer() {
      timer = setTimeout(() => setState("slow"), SLOW_TIMEOUT);
    }

    function onMessage(element, fn) {
      element.addEventListener("message", fn);
    }

    function onClick(element, fn) {
      element.addEventListener("click", fn);
    }

    function resetElements(e) {
      e.installBtn.classList.add("hidden");
      e.status.classList.remove("hidden");
      e.progress.classList.remove("red", "green", "complete");
      e.warning.textContent = "";
      e.warning.classList.add("hidden");
      e.warning.classList.remove("error");
      e.buttonGroup.classList.add("hidden");
      e.launchBtn.classList.add("hidden");
    }

    function setProgress({ speed, peers, progress, stage, bytes }) {
      // Update stats
      if (bytes || speed || peers !== undefined) {
        const parts = [
          bytes && '<span class="bytes">' + bytes + "</span>",
          speed && '<span class="speed">' + speed + "</span>",
          peers !== undefined &&
            '<span class="peers">' +
              peers +
              " " +
              (peers === 1 ? "peer" : "peers") +
              "</span>",
        ].filter(Boolean);
        elements.stats.innerHTML = parts.join("<span>•</span>");
      }

      // Update progress
      if (progress !== undefined) {
        elements.progress.classList.remove("indeterminate");
        elements.progress.classList.add("determinate");
        const progressBar = elements.progress.querySelector("div");

        // Enable transitions after first frame
        if (progress > 0) {
          elements.progress.classList.add("transitioning");
        }

        if (progress === 0) {
          elements.warning.textContent = "Starting platform installation";
          elements.warning.classList.remove("hidden", "error");
        }

        progressBar.style.width = progress + "%";
      }

      if (progress !== 0) {
        if (stage === 0) {
          elements.warning.textContent = "Installing platform...";
          elements.warning.classList.remove("hidden", "error");
        } else if (stage === 1) {
          elements.warning.textContent = "Platform ready, installing app...";
          elements.warning.classList.remove("hidden", "error");
        }
      }
    }

    function setState(state) {
      const {
        title,
        message,
        installBtn,
        progress,
        warning,
        buttonGroup,
        launchBtn,
      } = elements;

      resetElements(elements);
      clearTimeout(timer);
      timer = null;

      switch (state) {
        case "installing":
          title.textContent = "Welcome to PearPass";
          message.textContent = "It will launch once it is done.";
          break;
        case "slow":
          title.textContent = "Welcome to PearPass";
          message.textContent = "It will launch once it is done.";
          warning.textContent =
            "It's taking a bit of time, please check your connection.";
          warning.classList.remove("hidden");
          break;
        case "error":
          title.textContent = "Welcome to PearPass";
          message.textContent = "It will launch once it is done.";
          progress.classList.add("red");
          warning.textContent = "Installation didn't complete.";
          warning.classList.remove("hidden");
          warning.classList.add("error");
          buttonGroup.classList.remove("hidden");
          break;
        case "complete":
          title.textContent = "Installation complete!";
          progress.classList.add("complete");
          if (AUTO_LAUNCH) {
            message.textContent = "PearPass will launch shortly";
            setTimeout(() => bridge.postMessage("launch"), 500);
          } else {
            message.textContent = "PearPass is ready to launch.";
            launchBtn.classList.remove("hidden");
          }
          break;
      }
    }

    onMessage(bridge, (event) => {
      const { type, state, data } = event.data || {};
      switch (type) {
        case "state":
          setState(state);
          break;
        case "progress":
          setProgress(data);
          break;
      }
    });

    onClick(elements.installBtn, () => {
      setState("installing");
      bridge.postMessage("install");
      startTimer();
    });

    onClick(elements.retryBtn, () => {
      setState("installing");
      bridge.postMessage("install");
      startTimer();
    });

    onClick(elements.quitBtn, () => {
      bridge.postMessage("quit");
    });

    onClick(elements.launchBtn, () => {
      bridge.postMessage("launch");
    });
  </script>
`;
