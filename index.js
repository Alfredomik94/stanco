const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs'); // Aggiunto per verificare l'esistenza dei file
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log delle richieste - migliorato
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servire file statici
app.use(express.static('public'));

// Rotte di base
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API di autenticazione di esempio - con più logging
app.post('/api/auth/login', (req, res) => {
  console.log('Richiesta di login ricevuta:', req.body);
  
  const { username, password } = req.body;
  
  // Credenziali di test hardcoded
  const users = {
    'cliente': { password: 'cliente123', userType: 'customer', name: 'Cliente Demo' },
    'ristorante': { password: 'ristorante123', userType: 'tavola_calda', name: 'Ristorante Demo' },
    'onlus': { password: 'onlus123', userType: 'onlus', name: 'ONLUS Demo' }
  };
  
  console.log(`Tentativo di login con username: ${username}, password: ${password}`);
  
  if (users[username] && users[username].password === password) {
    const user = {
      id: Math.floor(Math.random() * 1000),
      username,
      name: users[username].name,
      userType: users[username].userType
    };
    console.log('Login riuscito:', user);
    
    // Aggiungi l'URL di redirect in base al tipo di utente
    const redirectUrl = `/dashboard/${user.userType === 'tavola_calda' ? 'tavola-calda' : user.userType}.html`;
    console.log('URL di redirect:', redirectUrl);
    
    res.json({ 
      success: true, 
      user,
      redirectUrl: redirectUrl
    });
  } else {
    console.log('Login fallito. Username trovato:', !!users[username]);
    if (users[username]) {
      console.log('Password inserita non corrisponde');
    }
    res.status(401).json({ success: false, message: 'Credenziali non valide' });
  }
});

// API per i ristoranti
app.get('/api/restaurants', (req, res) => {
  const restaurants = [
    { id: 1, name: 'Trattoria da Mario', type: 'Italiano', distance: '0.5 km', rating: 4.5 },
    { id: 2, name: 'Sushi Bar', type: 'Giapponese', distance: '1.2 km', rating: 4.3 },
    { id: 3, name: 'Pizzeria Napoletana', type: 'Italiano', distance: '0.8 km', rating: 4.7 },
    { id: 4, name: 'Bistrot Parigino', type: 'Francese', distance: '1.5 km', rating: 4.1 }
  ];
  res.json(restaurants);
});

// API per gli abbonamenti
app.get('/api/subscription-plans', (req, res) => {
  const plans = [
    { id: 1, userId: 2, name: 'Piano Pranzo', description: 'Pranzo completo', planType: 'completo', basePrice: 8.50 },
    { id: 2, userId: 2, name: 'Solo Primo', description: 'Solo primo piatto', planType: 'primo', basePrice: 5.00 },
    { id: 3, userId: 3, name: 'Piano Famiglia', description: 'Pasto completo famiglia', planType: 'completo', basePrice: 12.00 }
  ];
  res.json(plans);
});

// Crea un endpoint per creare nuovi piani di abbonamento
app.post('/api/subscription-plans', (req, res) => {
  console.log('Richiesta di creazione piano:', req.body);
  
  // Simuliamo la creazione di un piano - in una app reale salveremmo nel DB
  const newPlan = {
    id: Math.floor(Math.random() * 1000),
    userId: req.body.userId || 2,
    name: req.body.name,
    description: req.body.description,
    planType: req.body.planType,
    basePrice: parseFloat(req.body.basePrice)
  };
  
  res.json({ success: true, plan: newPlan });
});

// Pagina HTML di base
app.get('*', (req, res) => {
  // Se la richiesta è per una dashboard, servi il file appropriato
  if (req.path.startsWith('/dashboard/')) {
    const filePath = path.join(__dirname, 'public', req.path);
    console.log('Tentativo di servire dashboard:', filePath);
    
    // Controlla se il file esiste
    if (fs.existsSync(filePath)) {
      console.log('File dashboard trovato, serving...');
      return res.sendFile(filePath);
    } else {
      console.log('File dashboard NON trovato!');
      console.log('Contenuto della directory /public/dashboard:');
      try {
        const dashboardDir = path.join(__dirname, 'public', 'dashboard');
        if (fs.existsSync(dashboardDir)) {
          const files = fs.readdirSync(dashboardDir);
          console.log('File trovati:', files);
        } else {
          console.log('La directory dashboard non esiste!');
        }
      } catch (err) {
        console.log('Errore nella lettura della directory:', err);
      }
      return res.status(404).send('Dashboard non trovata. Controlla il percorso: ' + filePath);
    }
  }
  
  // Altrimenti servi la pagina principale
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermopolio</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f7f7f7;
            line-height: 1.6;
          }
          .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #333; margin-bottom: 20px; }
          h2 { color: #555; margin-top: 0; }
          button {
            background: #4a6cf7;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background: #3a5ce7;
          }
          button:disabled {
            background: #cccccc;
            cursor: not-allowed;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
          .error {
            color: #e53e3e;
            margin-top: 5px;
          }
          .success {
            color: #38a169;
            margin-top: 5px;
          }
          pre {
            background: #f1f1f1;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
          .user-info {
            background-color: #e6f7ff;
            border-left: 4px solid #1890ff;
            padding: 10px;
            margin-top: 10px;
            display: none;
          }
        </style>
      </head>
      <body>
        <h1>Thermopolio - Food Sharing</h1>
        
        <div class="card">
          <h2>Benvenuto</h2>
          <p>Questa è una versione di test dell'applicazione Thermopolio per la condivisione di cibo tra ristoranti, clienti e ONLUS.</p>
          <p>Puoi testare l'API utilizzando le credenziali demo qui sotto.</p>
          <div id="userInfoPanel" class="user-info"></div>
        </div>
        
        <div class="card">
          <h2>Login</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" placeholder="cliente, ristorante, onlus">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="cliente123, ristorante123, onlus123">
            </div>
            <button type="submit" id="loginButton">Accedi</button>
            <div id="loginMessage"></div>
          </form>
        </div>
        
        <div class="card">
          <h2>API Test</h2>
          <button id="getRestaurants" disabled>Carica Ristoranti</button>
          <button id="getSubscriptions" disabled>Carica Abbonamenti</button>
          <div id="apiResult" style="margin-top: 15px;"></div>
        </div>
        
        <script>
          // Controlla se l'utente è già loggato
          document.addEventListener('DOMContentLoaded', function() {
            const storedUser = localStorage.getItem('thermopolio_user');
            if (storedUser) {
              try {
                const user = JSON.parse(storedUser);
                
                // Redirect alla dashboard basato sul tipo di utente
                const redirectUrl = '/dashboard/' + (user.userType === 'tavola_calda' ? 'tavola-calda' : user.userType) + '.html';
                
                // Debug - consenti di visualizzare comunque la pagina principale
                document.getElementById('userInfoPanel').style.display = 'block';
                document.getElementById('userInfoPanel').innerHTML = '<strong>Utente connesso:</strong> ' + user.name + 
                    ' (' + user.userType + ') - <a href="' + redirectUrl + '">Vai alla dashboard</a>';
                
                // Non reindirizzare automaticamente per facilitare debug
                console.log('Utente già loggato, ma rimaniamo su questa pagina per debug. Dashboard disponibile qui:', redirectUrl);
              } catch (e) {
                console.error('Errore nel parsing dell\'utente salvato:', e);
                localStorage.removeItem('thermopolio_user');
              }
            }
          });

          // Login form
          document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('loginMessage');
            const loginButton = document.getElementById('loginButton');
            
            // Validazione base
            if (!username || !password) {
              messageEl.textContent = 'Inserisci sia username che password';
              messageEl.className = 'error';
              return;
            }
            
            messageEl.textContent = 'Tentativo di login in corso...';
            messageEl.className = '';
            loginButton.disabled = true;
            
            try {
              console.log('Invio dati di login:', { username, password });
              
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
              });
              
              console.log('Risposta ricevuta:', response.status);
              
              const data = await response.json();
              console.log('Dati ricevuti:', data);
              
              if (data.success) {
                // Salva l'utente in localStorage per simulare una sessione
                localStorage.setItem('thermopolio_user', JSON.stringify(data.user));
                
                // Mostra link anziché reindirizzare automaticamente (per debug)
                messageEl.innerHTML = 'Login effettuato con successo! <br><a href="' + data.redirectUrl + '" class="btn" style="display:inline-block;margin-top:10px;text-decoration:none;background:#4a6cf7;color:white;padding:8px 15px;border-radius:4px;">Vai alla Dashboard</a>';
                messageEl.className = 'success';
                
                document.getElementById('userInfoPanel').style.display = 'block';
                document.getElementById('userInfoPanel').innerHTML = '<strong>Utente connesso:</strong> ' + data.user.name + ' (' + data.user.userType + ')';
              } else {
                messageEl.textContent = data.message || 'Login fallito';
                messageEl.className = 'error';
              }
            } catch (error) {
              console.error('Errore durante il login:', error);
              messageEl.textContent = 'Errore durante il login: ' + error.message;
              messageEl.className = 'error';
            } finally {
              loginButton.disabled = false;
            }
          });
          
          // API Test buttons
          document.getElementById('getRestaurants').addEventListener('click', async function() {
            const resultEl = document.getElementById('apiResult');
            const button = this;
            
            button.disabled = true;
            resultEl.innerHTML = '<div>Caricamento ristoranti...</div>';
            
            try {
              const response = await fetch('/api/restaurants');
              const data = await response.json();
              
              resultEl.innerHTML = '<h3>Ristoranti</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              resultEl.innerHTML = '<div class="error">Errore: ' + error.message + '</div>';
            } finally {
              button.disabled = false;
            }
          });
          
          document.getElementById('getSubscriptions').addEventListener('click', async function() {
            const resultEl = document.getElementById('apiResult');
            const button = this;
            
            button.disabled = true;
            resultEl.innerHTML = '<div>Caricamento abbonamenti...</div>';
            
            try {
              const response = await fetch('/api/subscription-plans');
              const data = await response.json();
              
              resultEl.innerHTML = '<h3>Abbonamenti</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              resultEl.innerHTML = '<div class="error">Errore: ' + error.message + '</div>';
            } finally {
              button.disabled = false;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Avvio del server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Thermopolio in esecuzione su http://0.0.0.0:${PORT}`);
});