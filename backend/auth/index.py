import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle user authentication via Google and VK OAuth
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        provider = body_data.get('provider')
        token = body_data.get('token')
        
        if not provider or not token:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Provider and token required'}),
                'isBase64Encoded': False
            }
        
        import psycopg2
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        user_email = body_data.get('email')
        user_name = body_data.get('name')
        user_avatar = body_data.get('avatar')
        provider_id = body_data.get('provider_id')
        
        cur.execute(
            "SELECT id, email, name, balance FROM users WHERE email = %s",
            (user_email,)
        )
        user = cur.fetchone()
        
        if user:
            user_data = {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'balance': float(user[3])
            }
        else:
            cur.execute(
                "INSERT INTO users (email, name, avatar_url, auth_provider, auth_provider_id, balance) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, email, name, balance",
                (user_email, user_name, user_avatar, provider, provider_id, 0.00)
            )
            new_user = cur.fetchone()
            user_data = {
                'id': new_user[0],
                'email': new_user[1],
                'name': new_user[2],
                'balance': float(new_user[3])
            }
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': user_data, 'token': token}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
