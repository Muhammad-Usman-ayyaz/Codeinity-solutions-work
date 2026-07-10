function downloadResume() {
    const element = document.querySelector('.resume-box');
    const btn = document.getElementById('download-pdf');

    btn.style.display = 'none';
    window.scrollTo(0, 0);

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save('Muhammad_Usman_CV.pdf');

        btn.style.display = 'flex';
    });
}