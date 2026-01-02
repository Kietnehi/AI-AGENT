"""CSV analysis and data visualization tool"""
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, List, Optional
from config import Config


class DataAnalysisTool:
    """Tool for analyzing CSV files and creating visualizations"""
    
    def __init__(self):
        """Initialize data analysis tool"""
        self.df = None
        self.file_path = None
        
        # Create charts directory if it doesn't exist
        os.makedirs(Config.CHART_OUTPUT_DIR, exist_ok=True)
        
        # Set style for matplotlib
        sns.set_style("whitegrid")
        plt.rcParams['figure.figsize'] = (10, 6)
    
    def load_csv(self, file_path: str) -> str:
        """
        Load CSV file
        
        Args:
            file_path: Path to CSV file
            
        Returns:
            Summary of loaded data
        """
        try:
            # Check file size
            file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
            if file_size_mb > Config.MAX_CSV_SIZE_MB:
                return f"File quá lớn ({file_size_mb:.2f} MB). Tối đa {Config.MAX_CSV_SIZE_MB} MB."
            
            self.df = pd.read_csv(file_path)
            self.file_path = file_path
            
            return self.get_summary()
            
        except Exception as e:
            return f"Lỗi khi đọc file CSV: {str(e)}"
    
    def get_summary(self) -> str:
        """Get summary statistics of the loaded data"""
        if self.df is None:
            return "Chưa có dữ liệu nào được tải."
        
        summary = f"📊 Thông tin Dataset:\n"
        summary += f"- Số dòng: {len(self.df)}\n"
        summary += f"- Số cột: {len(self.df.columns)}\n"
        summary += f"- Tên các cột: {', '.join(self.df.columns.tolist())}\n\n"
        
        summary += "📈 5 dòng đầu tiên:\n"
        # Use tabulate for pretty printing
        try:
            from tabulate import tabulate
            summary += tabulate(self.df.head(), headers='keys', tablefmt='grid', showindex=True) + "\n\n"
        except ImportError:
            # Fallback if tabulate not installed
            summary += self.df.head().to_string() + "\n\n"
        
        summary += "📉 Thống kê mô tả:\n"
        try:
            from tabulate import tabulate
            desc_df = self.df.describe()
            summary += tabulate(desc_df, headers='keys', tablefmt='grid', showindex=True)
        except ImportError:
            summary += self.df.describe().to_string()
        
        return summary
    
    def get_info(self) -> str:
        """Get detailed information about the dataset"""
        if self.df is None:
            return "Chưa có dữ liệu nào được tải."
        
        info = "📋 Thông tin chi tiết các cột:\n\n"
        
        # Create a summary dataframe for better display
        info_data = []
        for col in self.df.columns:
            col_info = {
                'Cột': col,
                'Kiểu dữ liệu': str(self.df[col].dtype),
                'Null': self.df[col].isnull().sum(),
                'Unique': self.df[col].nunique()
            }
            
            if pd.api.types.is_numeric_dtype(self.df[col]):
                col_info['Min'] = f"{self.df[col].min():.2f}" if pd.notna(self.df[col].min()) else 'N/A'
                col_info['Max'] = f"{self.df[col].max():.2f}" if pd.notna(self.df[col].max()) else 'N/A'
                col_info['Mean'] = f"{self.df[col].mean():.2f}" if pd.notna(self.df[col].mean()) else 'N/A'
            else:
                col_info['Min'] = '-'
                col_info['Max'] = '-'
                col_info['Mean'] = '-'
            
            info_data.append(col_info)
        
        # Convert to DataFrame and print as table
        info_df = pd.DataFrame(info_data)
        
        try:
            from tabulate import tabulate
            info += tabulate(info_df, headers='keys', tablefmt='grid', showindex=False)
        except ImportError:
            info += info_df.to_string(index=False)
        
        return info
    
    def create_chart(self, chart_type: str, x_col: str = None, y_col: str = None, 
                    title: str = None, output_file: str = None) -> str:
        """
        Create various types of charts
        
        Args:
            chart_type: Type of chart (bar, line, scatter, histogram, pie, box, heatmap)
            x_col: Column for x-axis
            y_col: Column for y-axis
            title: Chart title
            output_file: Output filename (without extension)
            
        Returns:
            Path to saved chart or error message
        """
        if self.df is None:
            return "Chưa có dữ liệu nào được tải."
        
        try:
            if output_file is None:
                output_file = f"chart_{chart_type}"
            
            output_path = os.path.join(Config.CHART_OUTPUT_DIR, f"{output_file}.png")
            
            plt.figure(figsize=(12, 7))
            
            if chart_type == "bar":
                if x_col and y_col:
                    plt.bar(self.df[x_col], self.df[y_col])
                    plt.xlabel(x_col)
                    plt.ylabel(y_col)
                    plt.xticks(rotation=45, ha='right')
                else:
                    return "Cần chỉ định x_col và y_col cho biểu đồ cột."
            
            elif chart_type == "line":
                if x_col and y_col:
                    self.df.plot(x=x_col, y=y_col, kind='line', marker='o')
                else:
                    return "Cần chỉ định x_col và y_col cho biểu đồ đường."
            
            elif chart_type == "scatter":
                if x_col and y_col:
                    plt.scatter(self.df[x_col], self.df[y_col], alpha=0.5)
                    plt.xlabel(x_col)
                    plt.ylabel(y_col)
                else:
                    return "Cần chỉ định x_col và y_col cho biểu đồ phân tán."
            
            elif chart_type == "histogram":
                if x_col:
                    self.df[x_col].hist(bins=30, edgecolor='black')
                    plt.xlabel(x_col)
                    plt.ylabel("Tần suất")
                else:
                    return "Cần chỉ định x_col cho histogram."
            
            elif chart_type == "pie":
                if x_col:
                    self.df[x_col].value_counts().plot(kind='pie', autopct='%1.1f%%')
                    plt.ylabel("")
                else:
                    return "Cần chỉ định x_col cho biểu đồ tròn."
            
            elif chart_type == "box":
                if y_col:
                    if x_col:
                        self.df.boxplot(column=y_col, by=x_col)
                    else:
                        self.df[[y_col]].boxplot()
                else:
                    return "Cần chỉ định y_col cho box plot."
            
            elif chart_type == "heatmap":
                numeric_cols = self.df.select_dtypes(include=['number']).columns
                if len(numeric_cols) > 0:
                    correlation = self.df[numeric_cols].corr()
                    sns.heatmap(correlation, annot=True, cmap='coolwarm', center=0)
                else:
                    return "Không có cột số để tạo heatmap."
            
            else:
                return f"Loại biểu đồ '{chart_type}' không được hỗ trợ."
            
            if title:
                plt.title(title)
            else:
                plt.title(f"Biểu đồ {chart_type.upper()}")
            
            plt.tight_layout()
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            return f"✅ Đã tạo biểu đồ: {output_path}"
            
        except Exception as e:
            return f"Lỗi khi tạo biểu đồ: {str(e)}"
    
    def analyze_with_ai(self, prompt: str) -> str:
        """Use AI to analyze data based on user prompt"""
        if self.df is None:
            return "Chưa có dữ liệu nào được tải."
        
        try:
            # Get data summary for AI context
            data_context = f"""Dataset Information:
- Rows: {len(self.df)}
- Columns: {', '.join(self.df.columns.tolist())}

First 10 rows:
{self.df.head(10).to_string()}

Statistical Summary:
{self.df.describe().to_string()}

Data Types:
{self.df.dtypes.to_string()}
"""
            
            # Create prompt for Gemini
            full_prompt = f"""Bạn là một data analyst chuyên nghiệp. Hãy phân tích dữ liệu sau và trả lời câu hỏi của người dùng.

{data_context}

Câu hỏi của người dùng: {prompt}

Hãy trả lời bằng tiếng Việt, chi tiết và dễ hiểu. Nếu cần thống kê hoặc tính toán, hãy đưa ra con số cụ thể."""
            
            from google import genai
            from config import Config
            
            client = genai.Client(api_key=Config.GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=full_prompt
            )
            
            return response.text
            
        except Exception as e:
            return f"Lỗi khi phân tích với AI: {str(e)}"
    
    def analyze_column(self, column_name: str) -> str:
        """Analyze a specific column"""
        if self.df is None:
            return "Chưa có dữ liệu nào được tải."
        
        if column_name not in self.df.columns:
            return f"Cột '{column_name}' không tồn tại."
        
        col = self.df[column_name]
        analysis = f"Phân tích cột '{column_name}':\n\n"
        
        analysis += f"Kiểu dữ liệu: {col.dtype}\n"
        analysis += f"Số giá trị: {len(col)}\n"
        analysis += f"Giá trị null: {col.isnull().sum()} ({col.isnull().sum()/len(col)*100:.2f}%)\n"
        analysis += f"Giá trị unique: {col.nunique()}\n\n"
        
        if pd.api.types.is_numeric_dtype(col):
            analysis += "Thống kê:\n"
            analysis += f"  Min: {col.min()}\n"
            analysis += f"  Max: {col.max()}\n"
            analysis += f"  Mean: {col.mean():.2f}\n"
            analysis += f"  Median: {col.median():.2f}\n"
            analysis += f"  Std: {col.std():.2f}\n"
        else:
            analysis += "Top 10 giá trị phổ biến:\n"
            analysis += col.value_counts().head(10).to_string()
        
        return analysis


def analyze_csv(file_path: str) -> str:
    """
    Convenience function to load and analyze CSV
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        Analysis summary
    """
    tool = DataAnalysisTool()
    return tool.load_csv(file_path)
