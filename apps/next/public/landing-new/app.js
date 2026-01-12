(() => {
    // =========================
    // Configurações (ajuste aqui)
    // =========================
    const DEMO_URL = "/contact"; // Updated to match app routing
    const SIGNUP_ENDPOINT = "http://localhost:4001/api/signup";
    const REDIRECT_AFTER_SIGNUP = "/dashboard";

    // =========================
    // Tracking (placeholder)
    // =========================
    const track = (eventName, payload = {}) => {
        // Troque console.log por seu tracker (GA4/Segment/etc.)
        console.log(`[track] ${eventName}`, payload);
    };

    // =========================
    // Helpers
    // =========================
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    const isStrongEnoughPassword = (pwd) => String(pwd || "").length >= 8;

    // =========================
    // Elementos
    // =========================
    const modal = qs("#modal-signup");
    const overlay = qs("#modal-overlay");
    const closeBtn = qs("#modal-close");

    const openButtons = [
        qs("#btn-free"),
        qs("#btn-hero-free"),
        qs("#btn-how-free"),
        qs("#btn-final-free"),
    ].filter(Boolean);

    const demoButtons = [
        qs("#btn-demo"),
        qs("#btn-hero-demo"),
        qs("#btn-how-demo"),
        qs("#btn-final-demo"),
    ].filter(Boolean);

    const linkDemo = qs("#link-demo");
    const form = qs("#signup-form");
    const btnSubmit = qs("#btn-submit");

    const inputEmail = qs("#email");
    const inputPassword = qs("#password");
    const inputConfirm = qs("#confirm-password");

    const errEmail = qs("#email-error");
    const errPassword = qs("#password-error");
    const errConfirm = qs("#confirm-error");
    const formStatus = qs("#form-status");

    let lastFocusedEl = null;

    // =========================
    // Modal (A11y + foco)
    // =========================
    const setModalOpen = (open) => {
        if (!modal) return;

        if (open) {
            lastFocusedEl = document.activeElement;
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("no-scroll");
            track("modal_open_signup");

            // Foco inicial
            setTimeout(() => inputEmail?.focus(), 0);
        } else {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("no-scroll");

            // retorna foco
            if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
                lastFocusedEl.focus();
            }
        }
    };

    const openSignupModal = (source = "unknown") => {
        track("cta_click_free_account", { source });
        setModalOpen(true);
    };

    const closeSignupModal = () => setModalOpen(false);

    // Trap de foco
    const trapFocus = (e) => {
        if (!modal.classList.contains("is-open")) return;
        if (e.key !== "Tab") return;

        const focusables = qsa('button, a, input, [tabindex]:not([tabindex="-1"])', modal)
            .filter(el => !el.hasAttribute("disabled"));

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    // =========================
    // Accordion FAQ
    // =========================
    const initAccordion = () => {
        const items = qsa(".accordion__item");
        items.forEach((item) => {
            const btn = qs(".accordion__btn", item);
            if (!btn) return;

            btn.addEventListener("click", () => {
                const isOpen = item.classList.contains("is-open");
                items.forEach(i => {
                    i.classList.remove("is-open");
                    const b = qs(".accordion__btn", i);
                    if (b) b.setAttribute("aria-expanded", "false");
                    const icon = qs(".accordion__icon", i);
                    if (icon) icon.textContent = "+";
                });

                if (!isOpen) {
                    item.classList.add("is-open");
                    btn.setAttribute("aria-expanded", "true");
                    const icon = qs(".accordion__icon", item);
                    if (icon) icon.textContent = "–";
                }
            });
        });
    };

    // =========================
    // Demo
    // =========================
    const goToDemo = (source = "unknown") => {
        track("cta_click_demo", { source });
        if (DEMO_URL && DEMO_URL !== "#") {
            window.location.href = DEMO_URL;
            return;
        }
        // fallback: rolar para FAQ se demo não estiver configurada
        const faq = qs("#faq");
        faq?.scrollIntoView({ behavior: "smooth" });
    };

    // =========================
    // Validação e UI de erros
    // =========================
    const clearErrors = () => {
        errEmail.textContent = "";
        errPassword.textContent = "";
        errConfirm.textContent = "";
        formStatus.textContent = "";
    };

    const setStatus = (msg) => {
        formStatus.textContent = msg || "";
    };

    const validateForm = () => {
        clearErrors();

        const email = inputEmail.value.trim();
        const password = inputPassword.value;
        const confirm = inputConfirm.value;

        let ok = true;

        if (!isValidEmail(email)) {
            errEmail.textContent = "Digite um e-mail válido.";
            ok = false;
        }
        if (!isStrongEnoughPassword(password)) {
            errPassword.textContent = "Use pelo menos 8 caracteres (recomendado: letras e números).";
            ok = false;
        }
        if (password !== confirm) {
            errConfirm.textContent = "As senhas não coincidem.";
            ok = false;
        }

        return { ok, email, password };
    };

    const setLoading = (loading) => {
        if (!btnSubmit) return;
        btnSubmit.disabled = loading;
        btnSubmit.textContent = loading ? "Criando conta..." : "Criar conta e começar";
    };

    // =========================
    // Signup (POST /api/signup)
    // =========================
    const signup = async ({ email, password }) => {
        track("signup_submit", { email_domain: (email.split("@")[1] || "").toLowerCase() });

        const res = await fetch(SIGNUP_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // Convenção sugerida:
        // 201/200 OK → sucesso
        // 409 → e-mail já cadastrado
        // 400 → inválido
        // outros → genérico
        if (res.ok) return { ok: true };

        if (res.status === 409) return { ok: false, type: "EMAIL_EXISTS" };

        return { ok: false, type: "GENERIC" };
    };

    // =========================
    // Eventos
    // =========================
    openButtons.forEach((btn) => {
        btn.addEventListener("click", () => openSignupModal(btn.id || "cta"));
    });

    demoButtons.forEach((btn) => {
        btn.addEventListener("click", () => goToDemo(btn.id || "demo"));
    });

    linkDemo?.addEventListener("click", (e) => {
        e.preventDefault();
        closeSignupModal();
        goToDemo("modal_link");
    });

    overlay?.addEventListener("click", closeSignupModal);
    closeBtn?.addEventListener("click", closeSignupModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeSignupModal();
        trapFocus(e);
    });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const { ok, email, password } = validateForm();
        if (!ok) return;

        try {
            setLoading(true);
            setStatus("Processando...");

            const result = await signup({ email, password });
            if (result.ok) {
                track("signup_success");
                setStatus("Conta criada. Redirecionando...");
                window.location.href = REDIRECT_AFTER_SIGNUP;
                return;
            }

            track("signup_error", { type: result.type });

            if (result.type === "EMAIL_EXISTS") {
                errEmail.textContent = "Este e-mail já possui conta. Clique em ‘entrar’.";
                setStatus("");
                return;
            }

            setStatus("");
            errEmail.textContent = "Não foi possível criar sua conta agora. Tente novamente em instantes.";
        } catch (err) {
            track("signup_error", { type: "NETWORK_OR_RUNTIME" });
            setStatus("");
            errEmail.textContent = "Não foi possível criar sua conta agora. Tente novamente em instantes.";
        } finally {
            setLoading(false);
        }
    });

    // =========================
    // Init
    // =========================
    initAccordion();
})();
