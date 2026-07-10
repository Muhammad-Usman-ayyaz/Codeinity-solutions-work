document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("download-pdf");

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const element = document.querySelector(".resume-box");

            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';
            downloadBtn.style.pointerEvents = 'none';

            window.scrollTo(0, 0);

            const originalShadow = element.style.boxShadow;
            const originalMargin = element.style.margin;
            element.style.boxShadow = 'none';
            element.style.margin = '0';

            html2canvas(element, {
                scale: 2,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                onclone: (clonedDoc) => {
                    const circles = clonedDoc.querySelectorAll('.lang-item .circle');
                    circles.forEach((circle) => {
                        const styleStr = circle.getAttribute('style') || '';
                        let percent = 100;
                        const percentMatch = styleStr.match(/--percent:\s*([\d.]+)%/);
                        if (percentMatch) percent = parseFloat(percentMatch[1]);
                        
                        circle.style.background = 'none';
                        circle.style.display = 'flex';
                        circle.style.alignItems = 'center';
                        circle.style.justifyContent = 'center';
                        
                        const dashoffset = 213.628 * (1 - (percent / 100));
                        const svgHtml = `
                            <svg width="75" height="75" viewBox="0 0 75 75" style="position:absolute; top:0; left:0;">
                                <circle cx="37.5" cy="37.5" r="34" fill="#1e293b" stroke="#334155" stroke-width="7" />
                                <circle cx="37.5" cy="37.5" r="34" fill="transparent" stroke="rgb(93, 102, 210)" stroke-width="7" stroke-dasharray="213.628" stroke-dashoffset="${dashoffset}" transform="rotate(-90 37.5 37.5)" />
                            </svg>
                        `;
                        circle.insertAdjacentHTML('afterbegin', svgHtml);
                        const span = circle.querySelector('span');
                        if(span) {
                            span.style.position = 'relative';
                            span.style.zIndex = '1';
                        }
                    });
                }
            }).then(canvas => {
                element.style.boxShadow = originalShadow;
                element.style.margin = originalMargin;

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const { jsPDF } = window.jspdf;
                
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });

                pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                pdf.save('Muhammad_Usman_CV.pdf');

                downloadBtn.innerHTML = originalText;
                downloadBtn.style.pointerEvents = 'auto';
            }).catch(err => {
                console.error("PDF generation error: ", err);
                downloadBtn.innerHTML = originalText;
                downloadBtn.style.pointerEvents = 'auto';
                alert("An error occurred while generating the PDF.");
            });
        });
    }
});