export const capturePhoto = async (): Promise<string | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Stop tracks
    stream.getTracks().forEach(track => track.stop());
    
    return dataUrl;
  } catch (error) {
    console.error("Failed to capture silent photo:", error);
    return null;
  }
};

export const captureAudio = async (durationMs: number = 5000): Promise<string | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), durationMs);
    });
  } catch (error) {
    console.error("Failed to record evidence audio:", error);
    return null;
  }
};
