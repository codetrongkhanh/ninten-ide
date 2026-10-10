let editor;

// Mẫu code mặc định cho từng ngôn ngữ
const codeSnippets = {
    python: 'print("Chào mừng đến với NintenIDE!")\nname = input("Nhập tên của bạn: ")\nprint(f"Xin chào, {name}!")',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Chao mung den voi C++ trong NintenIDE!" << endl;\n    string name;\n    cin >> name;\n    cout << "Xin chao " << name << "!" << endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Chao mung den voi C!\\n");\n    char name[50];\n    scanf("%s", name);\n    printf("Xin chao %s!\\n", name);\n    return 0;\n}',
    java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.println("Chao mung den voi Java!");\n        String name = scanner.nextLine();\n        System.out.println("Xin chao " + name);\n    }\n}',
    javascript: 'console.log("Chao mung den voi JavaScript!");\nconst readline = require("readline").createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\nreadline.question("Ban ten la gi? ", name => {\n  console.log(`Xin chao ${name}!`);\n  readline.close();\n});',
    typescript: 'console.log("TypeScript Ready in NintenIDE!");',
    go: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Go language ready!")\n}',
    rust: 'fn main() {\n    println!("Hello, Rust!");\n}',
    php: '<?php\necho "Hello PHP!\\n";\n?>'
};

const fileExtensions = {
    python: 'main.py',
    cpp: 'main.cpp',
    c: 'main.c',
    java: 'Main.java',
    javascript: 'main.js',
    typescript: 'main.ts',
    go: 'main.go',
    rust: 'main.rs',
    php: 'main.php'
};

// Khởi tạo Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: codeSnippets['python'],
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false
    });

    // Lắng nghe sự kiện đổi ngôn ngữ
    document.getElementById('languageSelect').addEventListener('change', function(e) {
        const lang = e.target.value;
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, lang === 'cpp' || lang === 'c' ? 'cpp' : lang);
        editor.setValue(codeSnippets[lang] || '');
        
        const fileName = fileExtensions[lang];
        document.getElementById('fileNameDisplay').innerText = fileName;
        document.getElementById('tabName').innerText = fileName;
    });
});

// Hàm gọi API thực thi code (Piston API)
async function executeCode() {
    const langSelect = document.getElementById('languageSelect');
    const selectedOption = langSelect.options[langSelect.selectedIndex];
    const language = langSelect.value;
    const version = selectedOption.getAttribute('data-version');
    const sourceCode = editor.getValue();
    const stdin = document.getElementById('stdinInput').value;
    const outputConsole = document.getElementById('outputConsole');

    outputConsole.textContent = "Đang biên dịch và chạy code...";
    outputConsole.style.color = "#facc15"; // Màu vàng báo đang xử lý

    try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: language === 'cpp' || language === 'c' ? 'cpp' : language,
                version: version,
                files: [{ content: sourceCode }],
                stdin: stdin
            })
        });

        const result = await response.json();

        if (result.run) {
            let output = result.run.output;
            if (result.run.stderr) {
                outputConsole.style.color = "#f87171"; // Màu đỏ nếu có lỗi
            } else {
                outputConsole.style.color = "#4ade80"; // Màu xanh thành công
            }
            outputConsole.textContent = output || "Chương trình thực thi thành công nhưng không có output.";
        } else {
            outputConsole.style.color = "#f87171";
            outputConsole.textContent = "Lỗi kết nối tới máy chủ biên dịch.";
        }
    } catch (error) {
        outputConsole.style.color = "#f87171";
        outputConsole.textContent = "Lỗi hệ thống: " + error.message;
    }
}

function clearConsole() {
    document.getElementById('outputConsole').textContent = "";
    document.getElementById('stdinInput').value = "";
}
