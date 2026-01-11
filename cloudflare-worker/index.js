export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Check for authentication
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // Show friendly login page
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Nigeria Energy Dashboard - Secure Access</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            .login-container {
              background: rgba(255, 255, 255, 0.95);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
              max-width: 500px;
              width: 100%;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
              color: #1a2980;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
              font-size: 28px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              line-height: 1.5;
            }
            .note {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              margin: 20px 0;
              text-align: left;
              font-size: 14px;
            }
            .contact {
              margin-top: 20px;
              color: #666;
              font-size: 14px;
            }
            .btn {
              display: inline-block;
              background: #1a2980;
              color: white;
              padding: 12px 30px;
              border-radius: 8px;
              text-decoration: none;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="login-container">
            <div class="logo">⚡</div>
            <h1>Nigeria Energy Dashboard</h1>
            <p class="subtitle">Secure access to realtime energy monitoring and analytics</p>
            
            <div class="note">
              <p><strong>🔒 Protected Access</strong></p>
              <p>This dashboard contains sensitive energy data. Please enter your credentials when prompted.</p>
              <p>If you don't have access, contact the administrator.</p>
            </div>
            
            <p><em>A login prompt should appear automatically.</em></p>
            <p><em>If not, refresh the page or try a different browser.</em></p>
            
            <div class="contact">
              <p>URL: https://nigeria-energy-auth.bayode001.workers.dev</p>
              <p>For access issues: Contact system administrator</p>
            </div>
          </div>
        </body>
        </html>
      `, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Nigeria Energy Dashboard"',
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache'
        }
      });
    }
    
    try {
      // Decode credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = atob(base64Credentials);
      const [username, password] = credentials.split(':');
      
      // Get credentials from environment
      const validUsername = env.DASHBOARD_USERNAME;
      const validPassword = env.DASHBOARD_PASSWORD;
      
      // Validate credentials
      if (username !== validUsername || password !== validPassword) {
        // Add delay to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Access Denied</title>
            <style>
              body { font-family: Arial; padding: 50px; text-align: center; }
              .error { color: #dc3545; font-size: 48px; margin: 20px; }
            </style>
          </head>
          <body>
            <div class="error">❌</div>
            <h2>Invalid Credentials</h2>
            <p>The username or password you entered is incorrect.</p>
            <p>Please try again.</p>
            <script>
              setTimeout(() => location.reload(), 2000);
            </script>
          </body>
          </html>
        `, {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Nigeria Energy Dashboard"',
            'Content-Type': 'text/html'
          }
        });
      }
      
     // Successful authentication - forward to GitHub Pages
      console.log(`✅ Successful login: ${username} from ${request.headers.get('CF-Connecting-IP')}`);

    // Build GitHub Pages URL - NO /realtime/ needed!
      let githubPath = url.pathname;

    // For root path, just use '/'
      if (githubPath === '/' || githubPath === '') {
      githubPath = '/';  // ✅ Just root, no /realtime/
    }

      const githubUrl = `https://bayode001.github.io/nigeria-energy-dashboard${githubPath}`;
      
      
      // Forward request with security headers
      const response = await fetch(githubUrl, {
        headers: request.headers,
        method: request.method,
        redirect: 'follow'
      });
      
      // Add security headers to the response
      const modifiedResponse = new Response(response.body, response);
      modifiedResponse.headers.set('X-Frame-Options', 'DENY');
      modifiedResponse.headers.set('X-Content-Type-Options', 'nosniff');
      modifiedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return modifiedResponse;
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial; padding: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>Authentication Error</h2>
          <p>An error occurred while processing your request.</p>
          <p>Please try again later or contact the administrator.</p>
        </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
};