const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Configuração do Banco de Dados
// Ajuste conforme suas credenciais locais ou da AWS
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password', // Altere para sua senha
    database: 'focus_db'
};

const medications = [
    {
        name: "Ritalina 10mg",
        dosage: "10mg"
    },
    {
        name: "Ritalina LA 20mg",
        dosage: "20mg"
    },
    {
        name: "Ritalina LA 30mg",
        dosage: "30mg"
    },
    {
        name: "Ritalina LA 40mg",
        dosage: "40mg"
    },
    {
        name: "Venvanse 30mg",
        dosage: "30mg"
    },
    {
        name: "Venvanse 50mg",
        dosage: "50mg"
    },
    {
        name: "Venvanse 70mg",
        dosage: "70mg"
    },
    {
        name: "Concerta 18mg",
        dosage: "18mg"
    },
    {
        name: "Concerta 36mg",
        dosage: "36mg"
    },
    {
        name: "Concerta 54mg",
        dosage: "54mg"
    },
    {
        name: "Atentah 10mg",
        dosage: "10mg"
    },
    {
        name: "Atentah 18mg",
        dosage: "18mg"
    },
    {
        name: "Atentah 25mg",
        dosage: "25mg"
    },
    {
        name: "Atentah 40mg",
        dosage: "40mg"
    },
    {
        name: "Atentah 60mg",
        dosage: "60mg"
    },
    {
        name: "Atentah 80mg",
        dosage: "80mg"
    }
];

async function seed() {
    let connection;
    try {
        console.log('🔌 Conectando ao banco de dados...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado!');

        console.log('💊 Inserindo medicamentos...');

        for (const med of medications) {
            const id = crypto.randomUUID();
            const now = new Date();

            // Usando INSERT IGNORE ou ON DUPLICATE KEY UPDATE para evitar erros se rodar 2x
            // Aqui vamos assumir que queremos popular se não existir
            const [rows] = await connection.execute(
                'SELECT id FROM medications WHERE nome = ?',
                [med.name]
            );

            if (rows.length === 0) {
                await connection.execute(
                    'INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
                    [id, med.name, med.dosage, now, now]
                );
                console.log(`+ Inserido: ${med.name}`);
            } else {
                console.log(`= Já existe: ${med.name}`);
            }
        }

        console.log('✨ Seed concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o seed:', error.message);
        console.log('DICA: Verifique se suas credenciais no topo do arquivo seed.js estão corretas.');
    } finally {
        if (connection) await connection.end();
    }
}

seed();
