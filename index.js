const express = require('express');
const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const program = new Command();

program
    .requiredOption('-h, --host <host>', 'адреса сервера')
    .requiredOption('-p, --port <port>', 'порт сервера')
    .requiredOption('-c, --cache <cache>', 'шлях до директорії для кешу')
    .parse(process.argv);


const options = program.opts();

const app = express();

app.use(express.text());
app.use('/write', multer().none())

app.get('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;
    const notePath = path.join(options.cache, `${noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Нотатка не знайдена');
    }

    fs.readFile(notePath, 'utf8', (err, data) => {
        res.send(data);
    });
});
app.put('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;
    const notePath = path.join(options.cache, `${noteName}.txt`);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Нотатка не знайдена');
    }
    fs.writeFileSync(notePath, req.body);
    res.status(200).send('Ноатка оновлена');
});
app.delete('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;
    const notePath = path.join(options.cache, `${noteName}.txt`);
    if (!fs.existsSync(notePath)){
        return res.status(404).send('Нотатка не знайдена');
    }
    fs.unlinkSync(notePath);
    res.status(200).send('Нотатка видалена');
});

app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(options.cache)
        .filter(file => file.endsWith('.txt'))
        .map(file => {
            const noteName = file.replace('.txt', '');
            const noteContent = fs.readFileSync(path.join(options.cache, file), 'utf8');
            return {name: noteName, text: noteContent};
        });
    res.status(200).json(notes);
});
app.post('/write', (req, res) => {
    const noteName = req.body.note_name;
    const note = req.body.note;
    const notePath = path.join(options.cache, `${noteName}.txt`);
    if (fs.existsSync(notePath)) {
        return res.status(400).send('нотатка вже існує');
    }
    fs.writeFileSync(notePath, note);
    res.status(201).send('нотатка створена');
});
app.get('/UploadForm.html', (req, res) => {
    const formPath = path.join(options.cache, 'UploadForm.html');
    const formContent = fs.readFileSync(formPath, 'utf8');
    res.status(200).send(formContent);
});

app.listen(options.port, options.host, () => {
    console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
