
export function isDevelopmentEnvironment() {
  // Check various environment indicators
  const indicators = {
    nodeEnv: process.env.NODE_ENV,
    replitDeployment: process.env.REPLIT_DEPLOYMENT,
    hostname: process.env.HOSTNAME,
    pwd: process.env.PWD
  };
  
  // If explicitly set to production, respect that
  if (indicators.nodeEnv === 'production') {
    return false;
  }
  
  // If running in Replit deployment, it's production
  if (indicators.replitDeployment) {
    return false;
  }
  
  // If running in a typical development environment
  const isDev = !indicators.nodeEnv || 
               indicators.nodeEnv === 'development' || 
               (indicators.pwd && indicators.pwd.includes('/home/runner/'));
  
  return isDev;
}

export function logEnvironmentInfo() {
  console.log('🔍 Environment Detection:');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`   - REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT || 'undefined'}`);
  console.log(`   - PWD: ${process.env.PWD || 'undefined'}`);
  console.log(`   - Is Development: ${isDevelopmentEnvironment()}`);
}
