from instagram_private_api import Client, ClientError
import logging
import time
import pandas as pd
import random

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)

def view_stories(cl, user_id):
    try:
        stories = cl.user_reels_media(user_id=user_id)
        for story in stories.get('items', []):
            cl.story_seen([story])
            logging.info(f"Viewed story: {story['id']}")
            time.sleep(random.uniform(2, 5))
    except Exception as e:
        logging.error(f"Error viewing stories for user '{user_id}': {e}")

def view_posts(cl, user_id):
    try:
        posts = cl.user_feed(user_id)
        for post in posts.get('items', []):
            logging.info(f"Viewed post: {post['id']}")
            time.sleep(random.uniform(2, 5))
    except Exception as e:
        logging.error(f"Error viewing posts for user '{user_id}': {e}")

def like_and_save_post(cl, post_id):
    try:
        cl.post_like(post_id)
        cl.save_collection_add(post_id)
        logging.info(f"Liked and saved post: {post_id}")
        time.sleep(random.uniform(2, 5))
    except Exception as e:
        logging.error(f"Error liking and saving post '{post_id}': {e}")

def view_reels(cl, user_id):
    try:
        reels = cl.user_feed(user_id)
        for reel in reels.get('items', []):
            logging.info(f"Viewed reel: {reel['id']}")
            time.sleep(random.uniform(2, 5))
    except Exception as e:
        logging.error(f"Error viewing reels for user '{user_id}': {e}")

def watch_live(cl, user_id):
    try:
        live_info = cl.user_story_feed(user_id)
        live = live_info.get('broadcasts', [None])[0]
        if live:
            logging.info(f"Watching live: {live['id']}")
            time.sleep(600)  # Watch live for 10 minutes
    except Exception as e:
        logging.error(f"Error watching live for user '{user_id}': {e}")

def perform_actions(cl, usernames):
    for username in usernames:
        try:
            user_info = cl.username_info(username)
            user_id = user_info['user']['pk']
            logging.info(f"User ID for '{username}': {user_id}")

            # Выполняем все действия для пользователя
            view_stories(cl, user_id)
            view_posts(cl, user_id)
            view_reels(cl, user_id)
            watch_live(cl, user_id)

            # Лайкаем и сохраняем последний пост
            latest_posts = cl.user_feed(user_id)
            if latest_posts['items']:
                like_and_save_post(cl, latest_posts['items'][0]['id'])

        except ClientError as e:
            logging.error(f"ClientError occurred for user '{username}': {e}")
        except Exception as e:
            logging.error(f"Unexpected error for user '{username}': {e}")

def main():
    try:
        # Создаем экземпляр клиента
        cl = Client(auto_patch=True, authenticate=True)

        # Логинимся в Instagram
        cl.login(username="your_username", password="your_password")

        # Список пользователей, на которых нужно подписаться и выполнять действия
        usernames = ["argisht_i777", "_.nifudla._55", "uk_suraj_035", "elora99274"]

        while True:
            perform_actions(cl, usernames)
            logging.info("Completed all actions for today. Waiting until tomorrow...")
            time.sleep(24 * 60 * 60)  # Ждем 24 часа перед следующим выполнением

    except ClientError as e:
        logging.error(f"ClientError occurred: {e}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")

if __name__ == '__main__':
    main()
