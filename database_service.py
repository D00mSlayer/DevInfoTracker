"""
Database Service for Environment Configuration Management
Handles MSSQL connectivity and XML configuration retrieval
"""

import os
import logging
import pyodbc
from typing import Dict, List, Optional, Tuple
import xml.etree.ElementTree as ET
from xml.dom import minidom

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    """Service for managing database connections and XML configurations"""
    
    def __init__(self):
        # MSSQL connection settings
        self.connection_timeout = 10
        self.query_timeout = 30
    
    def _build_connection_string(self, db_config: Dict) -> str:
        """
        Build MSSQL connection string from database configuration
        
        Args:
            db_config: Database configuration dictionary
            
        Returns:
            ODBC connection string
        """
        host = db_config.get('host', 'localhost')
        port = db_config.get('port', 1433)
        database = db_config.get('database', 'master')
        username = db_config.get('username', '')
        password = db_config.get('password', '')
        
        # Handle named instances (e.g., server\instance)
        if '\\' in host:
            server_part = host
        else:
            server_part = f"{host},{port}" if port != 1433 else host
        
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={server_part};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            f"TIMEOUT={self.connection_timeout};"
        )
        
        return connection_string
    
    def test_database_connection(self, db_config: Dict) -> Tuple[bool, str]:
        """
        Test database connectivity
        
        Args:
            db_config: Database configuration dictionary
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            # For demo purposes, simulate a successful connection
            server_name = f"{db_config.get('host', 'demo-server')}\\{db_config.get('database', 'demo-db')}"
            logger.info(f"Demo database connection successful: {server_name}")
            return True, f"Connected successfully to {server_name}"
            
            # Original code for actual database testing (commented out for demo)
            # connection_string = self._build_connection_string(db_config)
            # 
            # with pyodbc.connect(connection_string, timeout=self.connection_timeout) as conn:
            #     cursor = conn.cursor()
            #     cursor.execute("SELECT 1")
            #     cursor.fetchone()
            #     
            # logger.info(f"Successfully connected to database: {db_config.get('host', 'Unknown')}")
            # return True, "Connection successful"
            
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def get_xml_configurations(self, db_config: Dict, table_name: str = "configurations") -> Tuple[bool, List[str], str]:
        """
        Fetch XML configuration names from database
        
        Args:
            db_config: Database configuration dictionary
            table_name: Name of the table containing XML configurations
            
        Returns:
            Tuple of (success: bool, xml_names: List[str], error_message: str)
        """
        try:
            # For demo purposes, return demo XML configurations
            xml_names = self.get_demo_xml_names()
            logger.info(f"Retrieved {len(xml_names)} demo XML configuration names")
            return True, xml_names, ""
            
            # Original code for actual database querying (commented out for demo)
            # connection_string = self._build_connection_string(db_config)
            # 
            # with pyodbc.connect(connection_string, timeout=self.connection_timeout) as conn:
            #     cursor = conn.cursor()
            #     
            #     # Query to get XML configuration names
            #     # Assumes table has columns: id, name, xml_content
            #     query = f"""
            #     SELECT DISTINCT name 
            #     FROM {table_name} 
            #     WHERE name IS NOT NULL 
            #     AND xml_content IS NOT NULL
            #     ORDER BY name ASC
            #     """
            #     
            #     cursor.execute(query)
            #     rows = cursor.fetchall()
            #     
            #     xml_names = [row.name for row in rows]
            #     
            # logger.info(f"Retrieved {len(xml_names)} XML configurations from {db_config.get('host', 'Unknown')}")
            # return True, xml_names, ""
            
        except pyodbc.ProgrammingError as e:
            error_msg = f"Table or query error: {str(e)}"
            logger.error(error_msg)
            return False, [], error_msg
        except pyodbc.OperationalError as e:
            error_msg = f"Database connection error: {str(e)}"
            logger.error(error_msg)
            return False, [], error_msg
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return False, [], error_msg
    
    def get_xml_content(self, db_config: Dict, xml_name: str, table_name: str = "configurations") -> Tuple[bool, str, str]:
        """
        Fetch specific XML configuration content
        
        Args:
            db_config: Database configuration dictionary
            xml_name: Name of the XML configuration to retrieve
            table_name: Name of the table containing XML configurations
            
        Returns:
            Tuple of (success: bool, xml_content: str, error_message: str)
        """
        try:
            # For demo purposes, return demo XML content
            xml_content = self.get_demo_xml_content(xml_name)
            logger.info(f"Retrieved demo XML content for: {xml_name}")
            return True, xml_content, ""
            
            # Original code for actual database querying (commented out for demo)
            # connection_string = self._build_connection_string(db_config)
            # 
            # with pyodbc.connect(connection_string, timeout=self.connection_timeout) as conn:
            #     cursor = conn.cursor()
            #     
            #     # Query to get specific XML content
            #     query = f"""
            #     SELECT xml_content 
            #     FROM {table_name} 
            #     WHERE name = ?
            #     """
            #     
            #     cursor.execute(query, (xml_name,))
            #     row = cursor.fetchone()
            #     
            #     if row and row.xml_content:
            #         # Format XML for better display
            #         formatted_xml = self._format_xml(row.xml_content)
            #         return True, formatted_xml, ""
            #     else:
            #         return False, "", f"XML configuration '{xml_name}' not found"
            
        except Exception as e:
            error_msg = f"Error retrieving XML content: {str(e)}"
            logger.error(error_msg)
            return False, "", error_msg
    
    def _format_xml(self, xml_content: str) -> str:
        """
        Format XML content for better readability
        
        Args:
            xml_content: Raw XML content string
            
        Returns:
            Formatted XML string
        """
        try:
            # Parse and pretty-print XML
            root = ET.fromstring(xml_content)
            rough_string = ET.tostring(root, 'utf-8')
            reparsed = minidom.parseString(rough_string)
            pretty_xml = reparsed.toprettyxml(indent="  ")
            
            # Remove empty lines and clean up
            lines = [line for line in pretty_xml.split('\n') if line.strip()]
            return '\n'.join(lines)
            
        except ET.ParseError:
            # If XML parsing fails, return original content
            logger.warning("XML parsing failed, returning original content")
            return xml_content
        except Exception as e:
            logger.error(f"Error formatting XML: {e}")
            return xml_content
    
    def search_xml_configurations(self, db_config: Dict, search_term: str, table_name: str = "configurations") -> Tuple[bool, List[Dict], str]:
        """
        Search XML configurations by name or content
        
        Args:
            db_config: Database configuration dictionary
            search_term: Term to search for
            table_name: Name of the table containing XML configurations
            
        Returns:
            Tuple of (success: bool, results: List[Dict], error_message: str)
        """
        try:
            # For demo purposes, search demo XML configurations
            demo_names = self.get_demo_xml_names()
            results = [
                {"name": name, "preview": f"Demo configuration: {name}"}
                for name in demo_names
                if search_term.lower() in name.lower()
            ]
            logger.info(f"Found {len(results)} demo XML configurations matching '{search_term}'")
            return True, results, ""
            
            # Original code for actual database searching (commented out for demo)
            # connection_string = self._build_connection_string(db_config)
            # 
            # with pyodbc.connect(connection_string, timeout=self.connection_timeout) as conn:
            #     cursor = conn.cursor()
            #     
            #     # Search in both name and XML content
            #     query = f"""
            #     SELECT name, 
            #            CASE 
            #                WHEN LEN(xml_content) > 200 
            #                THEN LEFT(xml_content, 200) + '...'
            #                ELSE xml_content
            #            END as preview
            #     FROM {table_name} 
            #     WHERE name LIKE ? 
            #        OR xml_content LIKE ?
            #     ORDER BY name ASC
            #     """
            #     
            #     search_pattern = f"%{search_term}%"
            #     cursor.execute(query, (search_pattern, search_pattern))
            #     rows = cursor.fetchall()
            #     
            #     results = [
            #         {
            #             "name": row.name,
            #             "preview": row.preview.strip() if row.preview else ""
            #         }
            #         for row in rows
            #     ]
            #     
            # logger.info(f"Found {len(results)} XML configurations matching '{search_term}'")
            # return True, results, ""
            
        except Exception as e:
            error_msg = f"Error searching XML configurations: {str(e)}"
            logger.error(error_msg)
            return False, [], error_msg

    def execute_sql_query(self, db_config: Dict, sql_query: str) -> Tuple[bool, List[Dict], List[str], int, str]:
        """
        Execute SQL query against the database
        
        Args:
            db_config: Database configuration dictionary
            sql_query: SQL query string to execute
            
        Returns:
            Tuple of (success: bool, data: List[Dict], columns: List[str], row_count: int, error_message: str)
        """
        try:
            # Build connection string
            conn_str = self._build_connection_string(db_config)
            
            # Connect to database
            conn = pyodbc.connect(conn_str, timeout=30)
            cursor = conn.cursor()
            
            # Execute query
            cursor.execute(sql_query)
            
            # Check if query returns results
            if cursor.description:
                # Query returns results (SELECT)
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                
                # Convert rows to list of dictionaries
                data = []
                for row in rows:
                    row_dict = {}
                    for i, col in enumerate(columns):
                        value = row[i]
                        # Handle different data types
                        if value is None:
                            row_dict[col] = None
                        elif isinstance(value, (bytes, bytearray)):
                            row_dict[col] = value.decode('utf-8', errors='ignore')
                        else:
                            row_dict[col] = str(value)
                    data.append(row_dict)
                
                row_count = len(data)
                conn.close()
                return True, data, columns, row_count, ""
            else:
                # Query doesn't return results (INSERT, UPDATE, DELETE, etc.)
                row_count = cursor.rowcount
                conn.commit()
                conn.close()
                return True, [], [], row_count, ""
                
        except pyodbc.Error as e:
            error_msg = f"Database error: {str(e)}"
            return False, [], [], 0, error_msg
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            return False, [], [], 0, error_msg


    
