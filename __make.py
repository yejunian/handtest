#!/usr/bin/python3

# for Windows

import os
import re

enc = [
    '7d', '4e', 'c5', 'b6', '0a', 'd9', 'e6', '6c', 'cd', '4c',
    'd7', 'fe', 'f5', 'cf', '7f', '0f', 'e8', '5b', 'a9', '9b',
    'd1', 'f7', '7e', 'a4', '6d', 'be', 'da', 'd8', 'b7', '2e',
    '5c', '8a', 'bd', 'e4', 'd5', 'af', '6b', '1b', 'eb', '5a',
    'ba', '0c', '1a', 'c0', 'b1', 'a5', '1f', 'ce', 'b5', 'dc',
    'a6', '3a', 'e1', 'f9', 'c7', '2b', 'c1', '4a', '0d', '6a',
    '9e', '7c', 'fa', 'a3', '4b', 'de', 'e2', '7a', '2c', 'a0',
    'c6', '2a', 'd3', '5f', 'bc', 'db', 'fd', '1c', 'b4', 'e9',
    'ea', 'd6', 'f3', 'df', '0e', 'b3', 'cb', 'b0', 'fb', '9a',
    'b2', '8c', 'bf', 'ef', 'ed', '3f', 'b8', '9c', 'c3', 'd4', '4f']

htmlPatt = re.compile('\[\[score_html_src\]\]')
imgPatt = re.compile('\[\[score_image_src\]\]')


def main():
    f = open('template.html', 'r', encoding='utf-8')
    src = ''.join(f.readlines())
    f.close()

    for i in range(101):
        dst = htmlPatt.sub(
            ('https://leeye51456.github.io/handtest/link/%s.html' % enc[i]), src)
        dst = imgPatt.sub(
            ('https://leeye51456.github.io/handtest/link/img/%s.png' % enc[i]), dst)
        if not os.path.isdir('link'):
            os.makedirs('link')
        f = open(('link/%s.html' % enc[i]), 'w', encoding='utf-8')
        f.write(dst)
        f.close()
        print('[%3d] saved: %s.html' % (i, enc[i]))

# <!-- score --> 등 template.html의 각 매크로 부분을 채워서 새로운 파일로 저장
# 파일명은 enc[점수].html

if __name__ == '__main__':
    main()
