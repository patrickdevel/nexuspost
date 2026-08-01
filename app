<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    
    <!-- SEO Meta Tags -->
    <title>cliq. – Verbinde dich mit der Welt | Social Media Experience</title>
    <meta name="description" content="cliq. kombiniert moderne Social-Media-Features, nahtlose Musikintegration und intelligente KI-Assistenten in einem flüssigen Aero-Glas-Erlebnis.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://cliqposts.vercel.app/">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://cliqposts.vercel.app/">
    <meta property="og:title" content="cliq. – Verbinde dich mit der Welt">
    <meta property="og:description" content="cliq. kombiniert moderne Social-Media-Features, nahtlose Musikintegration und intelligente KI-Assistenten in einem flüssigen Aero-Glas-Erlebnis.">
    <meta property="og:image" content="https://lh3.googleusercontent.com/d/1JNuBX1KLoY-rA54zFz_ocflS-F7HQvHW">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://cliqposts.vercel.app/">
    <meta name="twitter:title" content="cliq. – Verbinde dich mit der Welt">
    <meta name="twitter:description" content="cliq. kombiniert moderne Social-Media-Features, nahtlose Musikintegration und intelligente KI-Assistenten in einem flüssigen Aero-Glas-Erlebnis.">
    <meta name="twitter:image" content="https://lh3.googleusercontent.com/d/1JNuBX1KLoY-rA54zFz_ocflS-F7HQvHW">

    <!-- Structured Data / JSON-LD fuer Google -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "cliq.",
      "url": "https://cliqposts.vercel.app/",
      "description": "cliq. kombiniert moderne Social-Media-Features, nahtlose Musikintegration und intelligente KI-Assistenten in einem flüssigen Aero-Glas-Erlebnis.",
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "All"
    }
    </script>

    <link rel="icon" href="https://lh3.googleusercontent.com/d/1JNuBX1KLoY-rA54zFz_ocflS-F7HQvHW">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --nexus: #1877f2;
            --nexus-soft: rgba(24,119,242,0.12);
            --bg: #000000; 
            --card: rgba(28, 28, 30, 0.65); 
            --text: #ffffff; 
            --sub: #8e8e93; 
            --border: rgba(255, 255, 255, 0.12);
            --header-bg: rgba(18, 18, 18, 0.75);
            --radius: 20px;
            --radius-sm: 12px;
            --shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        body.light {
            --bg: #f0f2f5;
            --card: rgba(255, 255, 255, 0.75);
            --text: #1c1e21;
            --sub: #65676b;
            --border: rgba(0, 0, 0, 0.08);
            --header-bg: rgba(255, 255, 255, 0.82);
            --shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }

        body.theme-purple { --nexus: #8b5cf6; --nexus-soft: rgba(139,92,246,0.15); }
        body.theme-green  { --nexus: #10b981; --nexus-soft: rgba(16,185,129,0.15); }
        body.theme-rose   { --nexus: #f43f5e; --nexus-soft: rgba(244,63,94,0.15); }
        body.theme-orange { --nexus: #f97316; --nexus-soft: rgba(249,115,22,0.15); }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'DM Sans', -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            overflow-x: hidden;
            transition: background 0.4s, color 0.4s;
            line-height: 1.5;
        }

        /* ── BACKGROUND GLOW ANIMATIONS ── */
        .ambient-glow {
            position: fixed;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, var(--nexus) 0%, rgba(139,92,246,0.3) 50%, rgba(0,0,0,0) 70%);
            filter: blur(80px);
            opacity: 0.25;
            z-index: -1;
            pointer-events: none;
            animation: floatGlow 12s infinite alternate ease-in-out;
        }
        .glow-1 { top: -100px; left: -100px; }
        .glow-2 { bottom: -150px; right: -100px; animation-delay: -6s; }

        @keyframes floatGlow {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, 80px) scale(1.1); }
            100% { transform: translate(-30px, 40px) scale(0.95); }
        }

        /* ── NAV ── */
        nav {
            position: fixed;
            top: 0; left: 0; right: 0; height: 64px;
            background: var(--header-bg);
            backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 24px; border-bottom: 0.5px solid var(--border);
            z-index: 1000;
        }

        .logo {
            font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: var(--nexus);
            display: flex; align-items: center; gap: 10px; cursor: pointer;
            transition: transform 0.3s;
        }
        .logo:hover { transform: scale(1.02); }
        .logo-icon {
            background: var(--nexus); color: white; width: 32px; height: 32px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px var(--nexus-soft);
        }
        .logo-icon img { width: 20px; height: 20px; }

        .nav-links { display: flex; align-items: center; gap: 24px; list-style: none; }
        .nav-links a {
            color: var(--text); text-decoration: none; font-weight: 500; font-size: 15px;
            opacity: 0.8; transition: opacity 0.2s, color 0.2s;
        }
        .nav-links a:hover { opacity: 1; color: var(--nexus); }

        .nav-actions { display: flex; align-items: center; gap: 12px; }

        /* ── BUTTONS ── */
        .btn {
            background: var(--nexus); color: white; border: none;
            padding: 10px 20px; border-radius: 24px; font-weight: 600; font-size: 14px;
            cursor: pointer; display: flex; align-items: center; gap: 8px;
            transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
            font-family: inherit; text-decoration: none;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--nexus-soft); }
        .btn-secondary {
            background: var(--card); color: var(--text); border: 1px solid var(--border);
            backdrop-filter: blur(10px);
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }

        /* ── HERO SECTION ── */
        .hero {
            padding: 140px 24px 80px;
            max-width: 1200px; margin: 0 auto;
            display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
        }

        .hero-text h1 {
            font-family: 'Syne', sans-serif; font-size: 56px; font-weight: 800;
            line-height: 1.1; margin-bottom: 20px;
            background: linear-gradient(135deg, #ffffff 30%, var(--nexus));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        body.light .hero-text h1 {
            background: linear-gradient(135deg, #1c1e21 30%, var(--nexus));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .hero-text p {
            font-size: 18px; color: var(--sub); margin-bottom: 32px; max-width: 480px;
        }

        .hero-buttons { display: flex; gap: 16px; align-items: center; }

        /* ── HERO MOCKUP / PREVIEW ── */
        .hero-preview {
            position: relative; display: flex; justify-content: center; align-items: center;
        }

        .phone-mockup {
            width: 310px; height: 620px; background: #000; border-radius: 44px;
            border: 8px solid #2c2c2e; box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            position: relative; overflow: hidden; display: flex; flex-direction: column;
            animation: phoneFloat 6s ease-in-out infinite;
        }
        @keyframes phoneFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(1deg); }
        }

        .phone-notch {
            position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
            width: 100px; height: 20px; background: #000; border-radius: 10px; z-index: 100;
        }

        .mock-app-header {
            padding: 40px 16px 10px; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 0.5px solid var(--border); background: var(--header-bg);
        }
        .mock-feed { padding: 12px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; flex: 1; }
        
        .mock-card {
            background: var(--card); border-radius: 16px; padding: 12px; border: 0.5px solid var(--border);
            backdrop-filter: blur(10px);
        }

        .floating-badge {
            position: absolute; background: var(--card); border: 1px solid var(--border);
            padding: 12px 16px; border-radius: 16px; backdrop-filter: blur(16px);
            box-shadow: var(--shadow); display: flex; align-items: center; gap: 10px;
            animation: badgeFloat 4s ease-in-out infinite alternate;
        }
        .badge-1 { top: 10%; left: -20px; animation-delay: -1s; }
        .badge-2 { bottom: 15%; right: -10px; animation-delay: -2.5s; }

        @keyframes badgeFloat {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
        }

        /* ── FEATURES SECTION ── */
        .features { padding: 100px 24px; max-width: 1200px; margin: 0 auto; }
        
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-header h2 {
            font-family: 'Syne', sans-serif; font-size: 38px; font-weight: 800; margin-bottom: 12px;
        }
        .section-header p { color: var(--sub); font-size: 16px; }

        .grid-features {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;
        }

        .feature-card {
            background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
            padding: 32px; backdrop-filter: blur(16px); transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
            position: relative; overflow: hidden;
        }
        .feature-card:hover {
            transform: translateY(-6px); border-color: var(--nexus);
            box-shadow: 0 12px 40px var(--nexus-soft);
        }

        .feature-icon {
            width: 52px; height: 52px; border-radius: 16px; background: var(--nexus-soft);
            color: var(--nexus); display: flex; align-items: center; justify-content: center;
            margin-bottom: 20px; transition: transform 0.3s;
        }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-4deg); }

        .feature-card h3 { font-family: 'Syne', sans-serif; font-size: 20px; margin-bottom: 10px; }
        .feature-card p { color: var(--sub); font-size: 14.5px; line-height: 1.6; }

        /* ── THEME PREVIEW SECTION ── */
        .theme-section {
            padding: 80px 24px; max-width: 1200px; margin: 0 auto; text-align: center;
            background: var(--card); border: 1px solid var(--border); border-radius: 32px;
            backdrop-filter: blur(20px);
        }

        .theme-picker-landing {
            display: flex; justify-content: center; gap: 16px; margin-top: 24px;
        }
        .theme-dot-lg {
            width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
            border: 3px solid transparent; transition: transform 0.2s, border-color 0.2s;
        }
        .theme-dot-lg:hover { transform: scale(1.15); }
        .theme-dot-lg.active { border-color: var(--text); transform: scale(1.1); }

        /* ── FOOTER ── */
        footer {
            border-top: 1px solid var(--border); padding: 40px 24px;
            text-align: center; color: var(--sub); font-size: 14px;
            background: var(--header-bg); backdrop-filter: blur(20px);
        }

        /* RESPONSIVE */
        @media (max-width: 850px) {
            .hero { grid-template-columns: 1fr; text-align: center; padding-top: 100px; }
            .hero-text h1 { font-size: 40px; }
            .hero-text p { margin: 0 auto 32px; }
            .hero-buttons { justify-content: center; }
            .nav-links { display: none; }
            .floating-badge { display: none; }
        }
    </style>
</head>
<body>

    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <!-- NAVBAR -->
    <nav>
        <div class="logo">
            <div class="logo-icon"><img src="https://lh3.googleusercontent.com/d/1JNuBX1KLoY-rA54zFz_ocflS-F7HQvHW" alt="cliq logo"></div>
            cliq.
        </div>
        <ul class="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#themes">Design</a></li>
            <li><a href="#ai">KI-Assistent</a></li>
        </ul>
        <div class="nav-actions">
            <button class="btn btn-secondary" id="theme-toggle" onclick="toggleDarkModeLanding()" title="Modus wechseln">
                <i data-lucide="moon" style="width:18px;"></i>
            </button>
            <a href="index.html" class="btn">
                App öffnen <i data-lucide="arrow-right" style="width:16px;"></i>
            </a>
        </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-text">
            <h1>Verbinde dich mit deiner Welt.</h1>
            <p>cliq. kombiniert moderne Social-Media-Features, nahtlose Musikintegration und intelligente KI-Assistenten in einem flüssigen Aero-Glaß-Erlebnis.</p>
            <div class="hero-buttons">
                <a href="index.html" class="btn" style="padding: 14px 28px; font-size: 16px;">
                    <i data-lucide="sparkles"></i> Loslegen
                </a>
                <a href="#features" class="btn btn-secondary" style="padding: 14px 28px; font-size: 16px;">
                    Features erkunden
                </a>
            </div>
        </div>

        <div class="hero-preview">
            <!-- FLOATING BADGES -->
            <div class="floating-badge badge-1">
                <i data-lucide="music" style="color:var(--nexus);"></i>
                <div style="font-size:12px;"><strong>Soundtrack hinzufügen</strong><br><span style="color:var(--sub);">Viral Tracks inklusive</span></div>
            </div>
            <div class="floating-badge badge-2">
                <i data-lucide="bot" style="color:#8b5cf6;"></i>
                <div style="font-size:12px;"><strong>KI-Assistent</strong><br><span style="color:var(--sub);">Immer an deiner Seite</span></div>
            </div>

            <!-- PHONE MOCKUP -->
            <div class="phone-mockup">
                <div class="phone-notch"></div>
                <div class="mock-app-header">
                    <span style="font-family:'Syne'; font-weight:800; color:var(--nexus);">cliq.</span>
                    <i data-lucide="bell" style="width:16px; color:var(--sub);"></i>
                </div>
                <div class="mock-feed">
                    <div class="mock-card">
                        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                            <img src="https://lh3.googleusercontent.com/d/13kRpi9mCwLUMUer7Q8WXsy68YMN4Vnaq" alt="Profile" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
                            <span style="font-size:12px; font-weight:600;">@cliq.</span>
                        </div>
                        <div style="font-size:12px; color:var(--sub);">Einfach ein komplett neues Social-Experience. 🚀 #cliq #nextgen</div>
                    </div>
                    <div class="mock-card" style="background:var(--nexus-soft);">
                        <div style="font-size:11px; font-weight:700; color:var(--nexus); margin-bottom:4px;">📊 UMFRAGE</div>
                        <div style="font-size:12px; font-weight:600;">Gefällt euch das neue Design?</div>
                        <div style="background:rgba(255,255,255,0.2); height:6px; border-radius:3px; margin-top:8px;"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="features" id="features">
        <div class="section-header">
            <h2>Alles was du brauchst. In einer App.</h2>
            <p>Entwickelt für Geschwindigkeit, Ästhetik und maximale Interaktion.</p>
        </div>

        <div class="grid-features">
            <div class="feature-card">
                <div class="feature-icon"><i data-lucide="smartphone"></i></div>
                <h3>TikTok-Style Feed</h3>
                <p>Erlebe deine Medien in einem vertikalen Vollbild-Statusfeed. Mit flüssigen Scroll-Snap-Animationen, Reaktions-Buttons und Musik-Badges.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i data-lucide="bot"></i></div>
                <h3>Integrierter KI-Assistent</h3>
                <p>Greife direkt aus der Navigationsleiste auf deinen persönlichen Assistenten zu, um Texte zu verfassen, Ideen zu brainstormen oder Fragen zu klären.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i data-lucide="music-4"></i></div>
                <h3>Sound-Integration</h3>
                <p>Hinterlege deine Posts und Stories mit viralen Sounds und Musik-Previews. Inklusive direktem Cover-Spin und globalem Lautstärke-Control.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i data-lucide="bar-chart-2"></i></div>
                <h3>Interaktive Umfragen</h3>
                <p>Erstelle benutzerdefinierte Umfragen direkt im Composer. Lass deine Community in Echtzeit abstimmen mit animierten Fortschrittsbalken.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i data-lucide="palette"></i></div>
                <h3>Anpassbare Themes</h3>
                <p>Personalisierbare Akzentfarben (Purple, Green, Rose, Orange) gepaart mit einem dynamischen Dark- & Light-Mode im eleganten iOS Aero-Style.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i data-lucide="shield-check"></i></div>
                <h3>Volle Kontrolle</h3>
                <p>Inklusive privater Profile, umfassender Benachrichtigungseinstellungen, Bookmarks für deine Lieblings-Posts und Admin-Alert-Banner.</p>
            </div>
        </div>
    </section>

    <!-- THEMES INTERACTIVE PREVIEW -->
    <section class="features" id="themes">
        <div class="theme-section">
            <h2 style="font-family:'Syne'; font-size:32px; margin-bottom:8px;">Dein Style. Deine Wahl.</h2>
            <p style="color:var(--sub);">Wähle deine Lieblings-Akzentfarbe für cliq.</p>
            
            <div class="theme-picker-landing">
                <div class="theme-dot-lg active" style="background:#1877f2;" onclick="setLandingTheme('default', this)"></div>
                <div class="theme-dot-lg" style="background:#8b5cf6;" onclick="setLandingTheme('purple', this)"></div>
                <div class="theme-dot-lg" style="background:#10b981;" onclick="setLandingTheme('green', this)"></div>
                <div class="theme-dot-lg" style="background:#f43f5e;" onclick="setLandingTheme('rose', this)"></div>
                <div class="theme-dot-lg" style="background:#f97316;" onclick="setLandingTheme('orange', this)"></div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer>
        <p>cliq. v155.0 – Erstellt für die Zukunft der Interaktion 💙</p>
    </footer>

    <script>
        lucide.createIcons();

        function toggleDarkModeLanding() {
            document.body.classList.toggle('light');
            const icon = document.querySelector('#theme-toggle i');
            if (document.body.classList.contains('light')) {
                icon.setAttribute('data-lucide', 'sun');
            } else {
                icon.setAttribute('data-lucide', 'moon');
            }
            lucide.createIcons();
        }

        function setLandingTheme(theme, el) {
            document.body.classList.remove('theme-purple', 'theme-green', 'theme-rose', 'theme-orange');
            if (theme !== 'default') {
                document.body.classList.add('theme-' + theme);
            }
            document.querySelectorAll('.theme-dot-lg').forEach(dot => dot.classList.remove('active'));
            el.classList.add('active');
        }
    </script>
</body>
</html>
