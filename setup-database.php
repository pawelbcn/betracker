<?php
// Database setup script for shared hosting
$host = 'sql11.lh.pl';
$dbname = 'brasserwis_exptracker';
$username = 'brasserwis_exptracker';
$password = 'zLoJPi2l+RwL1vlN';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>Database Setup for Delegation Expense Tracker</h2>";
    echo "<p>Connecting to database...</p>";
    
    // Create delegations table
    $createDelegationsTable = "
    CREATE TABLE IF NOT EXISTS delegations (
        id VARCHAR(25) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        destination_country VARCHAR(100) NOT NULL,
        destination_city VARCHAR(100) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        purpose TEXT NOT NULL,
        exchange_rate DECIMAL(10,4) NOT NULL,
        daily_allowance DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($createDelegationsTable);
    echo "<p>✅ Delegations table created successfully</p>";
    
    // Create expenses table
    $createExpensesTable = "
    CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(25) PRIMARY KEY,
        delegation_id VARCHAR(25) NOT NULL,
        date DATETIME NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (delegation_id) REFERENCES delegations(id) ON DELETE CASCADE,
        INDEX idx_delegation_id (delegation_id)
    )";
    
    $pdo->exec($createExpensesTable);
    echo "<p>✅ Expenses table created successfully</p>";
    
    // Insert sample data
    $sampleDelegation = "
    INSERT IGNORE INTO delegations (id, title, destination_country, destination_city, start_date, end_date, purpose, exchange_rate, daily_allowance, notes) 
    VALUES ('sample_001', 'Business Trip to Germany', 'Germany', 'Berlin', '2024-01-15 09:00:00', '2024-01-18 17:00:00', 'Client meeting and project discussion', 4.25, 49.00, 'First delegation for testing')
    ";
    
    $pdo->exec($sampleDelegation);
    echo "<p>✅ Sample delegation data inserted</p>";
    
    $sampleExpense = "
    INSERT IGNORE INTO expenses (id, delegation_id, date, category, amount, currency, description) 
    VALUES ('exp_001', 'sample_001', '2024-01-15 12:00:00', 'Meals', 25.50, 'EUR', 'Lunch at restaurant')
    ";
    
    $pdo->exec($sampleExpense);
    echo "<p>✅ Sample expense data inserted</p>";
    
    echo "<h3>🎉 Database setup completed successfully!</h3>";
    echo "<p>Your delegation expense tracker is ready to use.</p>";
    echo "<p><a href='index.html'>Go to Application</a></p>";
    
} catch(PDOException $e) {
    echo "<h3>❌ Database setup failed</h3>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>Please check your database credentials and try again.</p>";
}
?>
