import { useEffect } from 'react';
import { zkLoginService } from '@/lib/zkLogin';

// Clear old zkLogin session on page load (one-time migration)
const ZkLoginMigration = () => {
  useEffect(() => {
    const migrationDone = localStorage.getItem('zklogin_migration_v1');
    
    if (!migrationDone && zkLoginService.isAuthenticated()) {
      console.log('🔄 Migrating zkLogin session to new format...');
      // Clear old session
      zkLoginService.clearSession();
      localStorage.setItem('zklogin_migration_v1', 'true');
      console.log('✅ Migration complete. Please sign in again.');
    }
  }, []);

  return null;
};

export default ZkLoginMigration;
