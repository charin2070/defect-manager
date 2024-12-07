import os
import re

def extract_content(file_path, pattern):
    """Извлекает содержимое файлов по заданному паттерну."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            matches = re.findall(pattern, content)
            return matches
    except Exception as e:
        print(f"Ошибка при чтении файла {file_path}: {e}")
        return []

def write_to_file(file_path, data):
    """Записывает данные в файл."""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(data)
    except Exception as e:
        print(f"Ошибка при записи в файл {file_path}: {e}")

def read_file(file_path):
    """Читает содержимое файла."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Ошибка при чтении файла {file_path}: {e}")
        return ""

def process_html(html_file_path):
    """Основная функция обработки HTML-файла."""
    try:
        directory = os.path.dirname(html_file_path)
        styles_file = os.path.join(directory, 'styles.css')
        scripts_file = os.path.join(directory, 'scripts.js')
        build_file = os.path.join(directory, 'build.html')

        # Паттерны для поиска ссылок на стили и скрипты
        css_pattern = r'<link[^>]+href=["\'](.*?\.css)["\'][^>]*>'
        js_pattern = r'<script[^>]+src=["\'](.*?)["\'][^>]*></script>'

        css_files = extract_content(html_file_path, css_pattern)
        js_files = extract_content(html_file_path, js_pattern)

        # Содержимое для новых файлов
        styles_content = ""
        scripts_content = ""

        # Чтение содержимого файлов стилей
        for css_file in css_files:
            css_file_path = os.path.join(directory, css_file)
            styles_content += read_file(css_file_path) + "\n"

        # Чтение содержимого файлов скриптов
        for js_file in js_files:
            js_file_path = os.path.join(directory, js_file)
            scripts_content += read_file(js_file_path) + "\n"

        # Запись в новые файлы
        write_to_file(styles_file, styles_content)
        write_to_file(scripts_file, scripts_content)

        # Создание нового HTML с инлайн стилями и скриптами
        with open(html_file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()

        html_content = re.sub(css_pattern, f'<style>\n{styles_content}</style>', html_content)
        html_content = re.sub(js_pattern, f'<script>\n{scripts_content}</script>', html_content)

        write_to_file(build_file, html_content)

        print(f"Стили сохранены в: {styles_file}")
        print(f"Скрипты сохранены в: {scripts_file}")
        print(f"Скомпилированный HTML сохранен в: {build_file}")

    except Exception as e:
        print(f"Ошибка при обработке HTML-файла: {e}")

if __name__ == "__main__":
    try:
        script_directory = os.path.dirname(os.path.abspath(__file__))
        default_html_file_path = os.path.join(script_directory, 'index.html')

        print(f"По умолчанию используется путь: {default_html_file_path}")
        html_file_path = input(f"Введите путь к HTML-файлу (или нажмите Enter для использования {default_html_file_path}): ")

        if html_file_path.strip() == "":
            html_file_path = default_html_file_path

        if not os.path.isfile(html_file_path):
            print(f"Файл не найден: {html_file_path}")
        else:
            process_html(html_file_path)
    except Exception as e:
        print(f"Произошла ошибка: {e}")

    input("Нажмите Enter для завершения...")
