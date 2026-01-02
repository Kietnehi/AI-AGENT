"""Main AI Agent with Gemini LLM"""
import os
import sys
from google import genai
from typing import Dict, List, Optional
from config import Config
from tools import search_web, wolfram_compute, DataAnalysisTool


class AIAgent:
    """AI Agent with Gemini LLM and multiple tools"""
    
    def __init__(self):
        """Initialize AI Agent"""
        # Validate configuration
        Config.validate()
        
        # Initialize Gemini client
        os.environ['GEMINI_API_KEY'] = Config.GEMINI_API_KEY
        self.client = genai.Client()
        self.model_name = 'gemini-2.5-flash'
        self.chat_history = []
        
        # Initialize tools
        self.data_tool = DataAnalysisTool()
        
        # Conversation history
        self.history = []
        
        print("🤖 AI Agent đã được khởi tạo!")
        print(f"📡 Công cụ tìm kiếm: {Config.get_search_engine_display()}")
        print(f"🧮 Wolfram Alpha: {'✓' if Config.WOLFRAM_APP_ID else '✗'}")
        print()
    
    def start_conversation(self):
        """Start a new conversation"""
        self.chat_history = []
        self.history = []
    
    def _build_system_prompt(self) -> str:
        """Build system prompt with available tools"""
        prompt = """Bạn là một AI Agent thông minh với nhiều khả năng:

1. TÌM KIẾM WEB: Bạn có thể tìm kiếm thông tin trên internet bằng cách sử dụng lệnh:
   [SEARCH: <truy vấn tìm kiếm>]
   
2. TÍNH TOÁN TOÁN HỌC: Bạn có thể thực hiện tính toán phức tạp với Wolfram Alpha:
   [WOLFRAM: <phép tính hoặc câu hỏi toán học>]
   
3. PHÂN TÍCH DỮ LIỆU CSV: Bạn có thể phân tích file CSV và tạo biểu đồ:
   - [LOAD_CSV: <đường dẫn file>] - Tải file CSV
   - [CSV_INFO] - Xem thông tin chi tiết
   - [CSV_ANALYZE: <tên cột>] - Phân tích cột cụ thể
   - [CREATE_CHART: type=<loại>, x=<cột x>, y=<cột y>, title=<tiêu đề>] - Tạo biểu đồ
     Các loại biểu đồ: bar, line, scatter, histogram, pie, box, heatmap

Khi người dùng yêu cầu thông tin hoặc tính toán, hãy sử dụng các công cụ trên.
Trả lời bằng tiếng Việt một cách thân thiện và chuyên nghiệp.
"""
        return prompt
    
    def _parse_and_execute_commands(self, text: str) -> str:
        """Parse and execute commands in the response"""
        result = text
        
        # Search command
        if "[SEARCH:" in text:
            start = text.find("[SEARCH:")
            end = text.find("]", start)
            if end != -1:
                query = text[start+8:end].strip()
                search_result = search_web(query)
                result = text[:start] + f"\n\n{search_result}\n\n" + text[end+1:]
        
        # Wolfram command
        if "[WOLFRAM:" in text:
            start = text.find("[WOLFRAM:")
            end = text.find("]", start)
            if end != -1:
                query = text[start+9:end].strip()
                wolfram_result = wolfram_compute(query)
                
                # Format result based on type
                if isinstance(wolfram_result, dict):
                    formatted_result = ""
                    if wolfram_result.get('text_results'):
                        formatted_result += "\n".join(wolfram_result['text_results'])
                    if wolfram_result.get('plots'):
                        formatted_result += f"\n\n📊 Có {len(wolfram_result['plots'])} biểu đồ được tạo"
                    if wolfram_result.get('images'):
                        formatted_result += f"\n\n🖼️ Có {len(wolfram_result['images'])} hình ảnh được tạo"
                else:
                    formatted_result = str(wolfram_result)
                
                result = text[:start] + f"\n\n🧮 Kết quả tính toán:\n{formatted_result}\n\n" + text[end+1:]
        
        # CSV commands
        if "[LOAD_CSV:" in text:
            start = text.find("[LOAD_CSV:")
            end = text.find("]", start)
            if end != -1:
                file_path = text[start+10:end].strip()
                csv_result = self.data_tool.load_csv(file_path)
                result = text[:start] + f"\n\n{csv_result}\n\n" + text[end+1:]
        
        if "[CSV_INFO]" in text:
            csv_result = self.data_tool.get_info()
            result = result.replace("[CSV_INFO]", f"\n\n{csv_result}\n\n")
        
        if "[CSV_ANALYZE:" in text:
            start = text.find("[CSV_ANALYZE:")
            end = text.find("]", start)
            if end != -1:
                column = text[start+13:end].strip()
                csv_result = self.data_tool.analyze_column(column)
                result = text[:start] + f"\n\n{csv_result}\n\n" + text[end+1:]
        
        if "[CREATE_CHART:" in text:
            start = text.find("[CREATE_CHART:")
            end = text.find("]", start)
            if end != -1:
                params_str = text[start+14:end].strip()
                params = {}
                for param in params_str.split(","):
                    if "=" in param:
                        key, value = param.split("=", 1)
                        params[key.strip()] = value.strip()
                
                chart_result = self.data_tool.create_chart(
                    chart_type=params.get('type', 'bar'),
                    x_col=params.get('x'),
                    y_col=params.get('y'),
                    title=params.get('title')
                )
                result = text[:start] + f"\n\n{chart_result}\n\n" + text[end+1:]
        
        return result
    
    def chat_with_agent(self, user_message: str) -> str:
        """
        Chat with the AI agent
        
        Args:
            user_message: User's message
            
        Returns:
            Agent's response
        """
        try:
            # Build conversation context
            if len(self.history) == 0:
                # First message includes system prompt
                full_message = self._build_system_prompt() + "\n\nNgười dùng: " + user_message
            else:
                # Subsequent messages include conversation history
                context = "\n\n".join([f"Người dùng: {h['user']}\nAgent: {h['agent']}" for h in self.history[-3:]])
                full_message = context + "\n\nNgười dùng: " + user_message
            
            # Get response from Gemini
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_message
            )
            agent_response = response.text
            
            # Parse and execute commands
            final_response = self._parse_and_execute_commands(agent_response)
            
            # Save to history
            self.history.append({
                'user': user_message,
                'agent': final_response
            })
            
            return final_response
            
        except Exception as e:
            return f"❌ Lỗi: {str(e)}"
    
    def change_search_engine(self, engine: str):
        """Change search engine (duckduckgo or serpapi)"""
        if engine.lower() in ['duckduckgo', 'serpapi']:
            Config.SEARCH_ENGINE = engine.lower()
            print(f"✓ Đã chuyển sang công cụ tìm kiếm: {Config.get_search_engine_display()}")
        else:
            print("✗ Công cụ tìm kiếm không hợp lệ. Chọn 'duckduckgo' hoặc 'serpapi'.")
    
    def interactive_mode(self):
        """Run agent in interactive mode"""
        print("="*60)
        print("🤖 AI AGENT - Interactive Mode")
        print("="*60)
        print("\nLệnh đặc biệt:")
        print("  /search <engine> - Đổi công cụ tìm kiếm (duckduckgo/serpapi)")
        print("  /clear - Xóa lịch sử hội thoại")
        print("  /exit hoặc /quit - Thoát")
        print("\nVí dụ:")
        print("  - Tìm kiếm thông tin về Python")
        print("  - Tính tích phân của x^2 từ 0 đến 10")
        print("  - Phân tích file data.csv của tôi")
        print("="*60)
        print()
        
        while True:
            try:
                user_input = input("👤 Bạn: ").strip()
                
                if not user_input:
                    continue
                
                # Handle special commands
                if user_input.startswith("/"):
                    cmd = user_input.lower()
                    
                    if cmd in ["/exit", "/quit"]:
                        print("\n👋 Tạm biệt!")
                        break
                    
                    elif cmd == "/clear":
                        self.start_conversation()
                        print("✓ Đã xóa lịch sử hội thoại")
                        continue
                    
                    elif cmd.startswith("/search "):
                        engine = cmd.split(" ", 1)[1]
                        self.change_search_engine(engine)
                        continue
                    
                    else:
                        print("❌ Lệnh không hợp lệ")
                        continue
                
                # Get agent response
                print("\n🤖 Agent: ", end="", flush=True)
                response = self.chat_with_agent(user_input)
                print(response)
                print()
                
            except KeyboardInterrupt:
                print("\n\n👋 Tạm biệt!")
                break
            except Exception as e:
                print(f"\n❌ Lỗi: {str(e)}\n")


def main():
    """Main function"""
    agent = AIAgent()
    agent.interactive_mode()


if __name__ == "__main__":
    main()
