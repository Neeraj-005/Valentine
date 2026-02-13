from flask import Flask, render_template
import os

app = Flask(__name__)

def get_music_files():
    """Get list of music files from static/music directory"""
    music_dir = os.path.join(app.static_folder, 'music')
    music_files = []
    
    if os.path.exists(music_dir):
        all_files = os.listdir(music_dir)
        # Filter only audio files
        music_files = [f for f in all_files if f.lower().endswith(('.mp3', '.mp4', '.wav', '.ogg', '.m4a'))]
    
    return music_files

@app.route('/')
def home():
    """Home page - Romantic hero section"""
    return render_template('index.html', music_files=get_music_files())

@app.route('/gallery')
def gallery():
    """Gallery page - Photo memories feed"""
    # Path to photos directory
    photos_dir = os.path.join(app.static_folder, 'photos')
    
    # Get list of image files
    photo_files = []
    
    if os.path.exists(photos_dir):
        all_files = os.listdir(photos_dir)
        # Filter only image files
        photo_files = [f for f in all_files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
    
    # If no photos found, use placeholders
    if not photo_files:
        photo_files = ['placeholder.jpg'] * 6
    
    return render_template('gallery.html', photos=photo_files, music_files=get_music_files())

@app.route('/message')
def message():
    """Love message page with typing animation"""
    return render_template('message.html', music_files=get_music_files())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
