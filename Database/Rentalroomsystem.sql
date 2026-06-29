USE [master]
GO
/****** Object:  Database [RentalRoomSystem]    Script Date: 6/29/2026 4:37:53 PM ******/
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'RentalRoomSystem')
BEGIN
    ALTER DATABASE RentalRoomSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE RentalRoomSystem;
END
GO
CREATE DATABASE [RentalRoomSystem]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'RentalRoomSystem', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER01\MSSQL\DATA\RentalRoomSystem.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'RentalRoomSystem_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER01\MSSQL\DATA\RentalRoomSystem_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [RentalRoomSystem] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [RentalRoomSystem].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [RentalRoomSystem] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET ARITHABORT OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [RentalRoomSystem] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [RentalRoomSystem] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET  ENABLE_BROKER 
GO
ALTER DATABASE [RentalRoomSystem] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [RentalRoomSystem] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET RECOVERY FULL 
GO
ALTER DATABASE [RentalRoomSystem] SET  MULTI_USER 
GO
ALTER DATABASE [RentalRoomSystem] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [RentalRoomSystem] SET DB_CHAINING OFF 
GO
ALTER DATABASE [RentalRoomSystem] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [RentalRoomSystem] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [RentalRoomSystem] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [RentalRoomSystem] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'RentalRoomSystem', N'ON'
GO
ALTER DATABASE [RentalRoomSystem] SET QUERY_STORE = ON
GO
ALTER DATABASE [RentalRoomSystem] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [RentalRoomSystem]
GO
/****** Object:  Table [dbo].[bookings]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bookings](
	[booking_id] [int] IDENTITY(1,1) NOT NULL,
	[listing_id] [int] NOT NULL,
	[tenant_id] [int] NOT NULL,
	[landlord_id] [int] NOT NULL,
	[type] [varchar](15) NOT NULL,
	[status] [varchar](10) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[booking_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[complaints]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[complaints](
	[complaint_id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[tenant_id] [int] NOT NULL,
	[landlord_id] [int] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NOT NULL,
	[complaint_type] [varchar](15) NULL,
	[status] [varchar](15) NULL,
	[priority] [varchar](10) NULL,
	[resolution_notes] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[complaint_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[contracts]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[contracts](
	[contract_id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[tenant_id] [int] NOT NULL,
	[landlord_id] [int] NOT NULL,
	[contract_number] [varchar](50) NOT NULL,
	[start_date] [datetime] NOT NULL,
	[end_date] [datetime] NOT NULL,
	[monthly_rent] [decimal](10, 2) NOT NULL,
	[deposit_amount] [decimal](10, 2) NULL,
	[status] [varchar](50) NULL,
	[tenant_agreed] [bit] NULL,
	[terms_and_conditions] [nvarchar](max) NULL,
	[document_url] [nvarchar](500) NULL,
	[is_renewed] [bit] NULL,
	[renewal_contract_id] [int] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[tenant_name] [nvarchar](100) NULL,
	[tenant_ic] [varchar](20) NULL,
	[tenant_ic_issue_date] [date] NULL,
	[tenant_ic_issue_place] [nvarchar](255) NULL,
	[tenant_permanent_address] [nvarchar](255) NULL,
	[landlord_name] [nvarchar](100) NULL,
	[landlord_ic] [varchar](20) NULL,
	[landlord_ic_issue_date] [date] NULL,
	[landlord_ic_issue_place] [nvarchar](255) NULL,
	[landlord_permanent_address] [nvarchar](255) NULL,
	[landlord_signature] [nvarchar](max) NULL,
	[tenant_signature] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[contract_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[conversations]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[conversations](
	[conversation_id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NULL,
	[participant_1_id] [int] NOT NULL,
	[participant_2_id] [int] NOT NULL,
	[last_message] [nvarchar](max) NULL,
	[last_message_at] [datetime] NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[conversation_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[facilities]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[facilities](
	[facility_id] [int] IDENTITY(1,1) NOT NULL,
	[facility_name] [nvarchar](100) NOT NULL,
	[category] [varchar](15) NULL,
	[facility_type] [varchar](50) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[facility_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[favorites]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[favorites](
	[favorite_id] [int] IDENTITY(1,1) NOT NULL,
	[tenant_id] [int] NOT NULL,
	[room_id] [int] NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[favorite_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[messages]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[messages](
	[message_id] [int] IDENTITY(1,1) NOT NULL,
	[conversation_id] [int] NOT NULL,
	[sender_id] [int] NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[is_read] [bit] NULL,
	[read_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[message_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notifications]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notifications](
	[notification_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[notification_type] [varchar](20) NULL,
	[related_id] [int] NULL,
	[is_read] [bit] NULL,
	[read_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[notification_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[otp_verifications]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[otp_verifications](
	[otp_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[otp_code] [varchar](10) NOT NULL,
	[purpose] [varchar](30) NOT NULL,
	[expired_at] [datetime] NOT NULL,
	[is_used] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[otp_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[payments]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[payments](
	[payment_id] [int] IDENTITY(1,1) NOT NULL,
	[contract_id] [int] NULL,
	[tenant_id] [int] NOT NULL,
	[landlord_id] [int] NOT NULL,
	[room_id] [int] NOT NULL,
	[viewing_schedule_id] [int] NULL,
	[amount] [decimal](10, 2) NOT NULL,
	[payment_type] [varchar](50) NULL,
	[status] [varchar](50) NULL,
	[payment_method] [varchar](20) NULL,
	[transaction_id] [varchar](255) NULL,
	[due_date] [datetime] NULL,
	[paid_date] [datetime] NULL,
	[notes] [nvarchar](max) NULL,
	[platform_fee] [decimal](10, 2) NULL,
	[refund_amount] [decimal](10, 2) NULL,
	[net_amount] [decimal](10, 2) NULL,
	[payout_status] [varchar](15) NULL,
	[payout_date] [datetime] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[payment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[properties]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[properties](
	[property_id] [int] IDENTITY(1,1) NOT NULL,
	[landlord_id] [int] NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[address] [nvarchar](500) NOT NULL,
	[city] [nvarchar](100) NOT NULL,
	[district] [nvarchar](100) NULL,
	[ward] [nvarchar](100) NULL,
	[total_floors] [int] NULL,
	[thumbnail_url] [nvarchar](500) NULL,
	[status] [varchar](15) NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[property_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[rental_requests]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[rental_requests](
	[request_id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[tenant_id] [int] NOT NULL,
	[landlord_id] [int] NOT NULL,
	[status] [varchar](50) NULL,
	[requested_move_in_date] [datetime] NULL,
	[lease_duration_months] [int] NULL,
	[message] [nvarchar](max) NULL,
	[rejection_reason] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[request_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[roles]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[role_id] [int] IDENTITY(1,1) NOT NULL,
	[role_name] [varchar](50) NOT NULL,
	[description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[room_facilities]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[room_facilities](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[facility_id] [int] NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[room_images]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[room_images](
	[image_id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[image_url] [nvarchar](500) NOT NULL,
	[is_primary] [bit] NULL,
	[display_order] [int] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[image_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[rooms]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[rooms](
	[room_id] [int] IDENTITY(1,1) NOT NULL,
	[landlord_id] [int] NOT NULL,
	[property_id] [int] NULL,
	[floor] [int] NULL,
	[room_number] [varchar](20) NULL,
	[title] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[address] [nvarchar](500) NOT NULL,
	[city] [nvarchar](100) NOT NULL,
	[district] [nvarchar](100) NULL,
	[ward] [nvarchar](100) NULL,
	[price_per_month] [decimal](10, 2) NOT NULL,
	[area_sqm] [decimal](8, 2) NULL,
	[room_type] [varchar](15) NULL,
	[bedrooms] [int] NULL,
	[max_occupants] [int] NULL,
	[status] [varchar](15) NULL,
	[thumbnail_url] [nvarchar](500) NULL,
	[rejection_reason] [nvarchar](max) NULL,
	[is_deleted] [bit] NULL,
	[updated_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[full_name] [nvarchar](100) NOT NULL,
	[email] [varchar](255) NOT NULL,
	[password_hash] [varchar](255) NULL,
	[phone] [varchar](20) NULL,
	[role_id] [int] NOT NULL,
	[avatar_url] [nvarchar](500) NULL,
	[google_id] [varchar](255) NULL,
	[is_active] [bit] NULL,
	[is_banned] [bit] NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[ic_number] [varchar](20) NULL,
	[ic_issue_date] [date] NULL,
	[ic_issue_place] [nvarchar](255) NULL,
	[permanent_address] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[viewing_schedules]    Script Date: 6/29/2026 4:37:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[viewing_schedules](
	[schedule_id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[tenant_id] [int] NOT NULL,
	[landlord_id] [int] NOT NULL,
	[scheduled_date] [datetime] NOT NULL,
	[status] [varchar](50) NULL,
	[deposit_amount] [decimal](10, 2) NULL,
	[tenant_decision] [varchar](50) NULL,
	[payment_deadline] [datetime] NULL,
	[dispute_reason] [nvarchar](max) NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[schedule_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[contracts] ON 

INSERT [dbo].[contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [tenant_name], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [landlord_name], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_signature]) VALUES (2, 66, 1006, 2, N'CT-753428-736', CAST(N'2026-06-28T00:00:00.000' AS DateTime), CAST(N'2026-09-28T00:00:00.000' AS DateTime), CAST(2000000.00 AS Decimal(10, 2)), CAST(2000000.00 AS Decimal(10, 2)), N'active', 1, N'fsfs', NULL, 0, NULL, CAST(N'2026-06-28T16:22:33.430' AS DateTime), CAST(N'2026-06-28T16:28:45.323' AS DateTime), N'Hoàng Nhật Kha', N'049205005039', CAST(N'2024-01-16' AS Date), N'Cục Cảnh sát xã hội', N'56 Doãn uẩn ngũ hành sơn đà nẵng', N'Nhật kha', N'049205005039', CAST(N'2026-06-28' AS Date), N'cục cảnh sát', N'39 Lê Thiện Trị', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782664111/signatures/zwscaapdbu0g01l18out.png', N'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAP1ElEQVR4AeydDag1RRnHn6kszZSStPyITENKK5Isyw/yldKMLAw/CM3sy0IL0jJKpDcLscIwyJTeDL+SSpE004qKNEWLMinSNFIrS00tS98Syxr/z96d++49755zz71n9+zXb3ieM7OzszOzv7n3z+yc3T1PMgIEIACBjhBAsDoyUHQTAhAwQ7D4K6iZQNzTLEb5gTU3RPUDIIBgDWCQ0yk2FB+Rt4tg5SCIVk8AwVo9O46cjsBtebGH85gIAqsmgGCtGh0HrpDAPSssT3EIbEQAwdoICRkVE3hbXt+teUw0DwI9bQPB6unAtui09lvoS7h+IeYTAqsngGCtnh1HLksgvjYvck0eE0FgJgII1kz4OHgZAmvy/QhWDoJoNgIIVhk/8qoi8Oy8IgQrB0E0GwEEazZ+HD2ZwG7afaf8l3IMAjMTQLBmRkgF5QTilsrfWn6VWXjECBCogACCVQFEqigl4He2+wwr3ThaWqj5THrQJQIIVpdGq1t9PS7vLvdf5SCIZieAYM3OkBrKCfjloC+2/7x8N7kQWDkBBGvlzDhiOgJ+OXitWfiXESBQEYEZBauiXlBNzwjEffITuj+PiSBQCQEEqxKMVDJCgOcHR4CwWQ0BBKsajtSylMBe2rxbfoscg0BlBBCsylD2vqIpTzBuoYJ+h/umZuEBI0CgQgIIVoUwqSojsK8+d5D7t4SKMAhURwDBqo4lNS0QOGkhMr+lwQgQqJIAglUlTepyAn5J6DHeYQJt7TqC1daR6WS/or+s7xV517+ex0QQqIwAglUZSioSgV3kyR5KCWIIVEUAwaqKJPU4gXT/ldLhUn1gEKiUAIJVKc6Fygb8mdavuP9qwH8EdZ46glUn3UHVHX3tyt3PmgeenQJeOQEEq3Kkg60wiZUD4A2jTgGvnACCVTnSwVZYFKwbBkOBE50rAQRrrrjraCxebxbXyw+to/YV1HnshrLhpg1pUhCojgCCVR3LBmqKX1Wje8s3l6+TN2Sx+BgOd7g3NApDaBbB6uwox5ep64fIk92cEvOPQ/Eh5wvm3z4tDoVAs4I1FMr1nOcpqvZZ8mQ/SYlm4hDU7nZm4XwjQKAmAghWTWDnUO1hI238amS7gc1wbwON0uSACCBYnRzsmN6I8P9C97X4XtgiCYEeEkCwOjeo8Rnqsr9zSpGl8dP6VXjQM9rr9AwCsxNIf/Cz10QN8yLgty8cPNJYw+tXI71hEwI1EUCwagJbY7Vr87rTepG/FYFXueRQiPpNAMHq1PjGHdXdbeSPy7eVu22mj1/LMQi0hUBt/UCwakNbS8XHqNanyx+TJ/uRWXjUCBAYAAEEq1uD/Kq8u0XB+laeRwSB3hNAsDozxNFfP3xQ3t2t8vguxd+UN2xRM794ScOdoPkBEECw2jfI43qUXj+8Pi/g92BdaRbStjUToq+lnae2DzOLX1aMQaA2AghWbWgrrzi9vmWTvGYfu1/k6QajkL6t9D7c6B84BOoi4H/0ddVNvdUSSDOsp+XV/lfxFfIWGM8RtmAQBtEFBKsTwxz9ssvfzpB664vu68zCw9aasGSm1Zpetb0j9G9lBBCslfFqqvReajgttCtpPsvivVNOAh8UAQSrG8OdbmdIvf2jEpfJMQgMigCC1Y3h3mmkmxeahWgECAyMQKcFa0BjdUDhXH2x/crCNkkIDIYAgtX6oY6fVBe3lCc7zyzwu39GGCIBBKv9o/7ekS624M2iIz1iEwJzIoBgzQn06pqJvtj+nMKxdyp9tTy3OJxHYvIzJho2AQSr3eN/jrr3ZHmyi8zCHywL0S8VdXloPBKT8eBjCAQQrNaOcnyBura7PJnPrvJn9aI/CL027VDMIzGCgPWfAILV3jH+rLoW5Mn8VoZ7zaLPrIpvRjjb+GktI/SJwPhzQbDGs2lwT9xUjb9Jnux2JS6VWOnyz9YqvbXc7RqzcLwRIDAQAghWOwfaX8rnrz5OvXu/Eu+RF2dWErCwRnkYBAZDAMFq3VDH3dSlN8iTXafEGfIT5MlONQuHGwECAyOAYLVvwNeNdOmf2k7vwlLSTjILvo5l5YFcCPSXAILVqrGN26s7r5Yn81cgF9eyfGbls620nxgCgyKAYLVruP397GlMorrmtzYoyuxMfX5JjkFgsATSP8dgAbTnxKO/48rfe5W6FFIijy82Cw8YAQIbCAwuhWC1Z8j9dcejIpV6598I3pQ2iCEwVAIIVitGPr5I3XidvMz813FOL9tBHgSGRgDBaseIf1rdKD4zqM1F0zeC4ebFLRIQGDCBIQtWS4Y9+o9LvLWkM/9Rnr+oL39+UFsYBAZOAMFq/g/gM+pC2Tg8Rfk3moX7jQABCGQEyv5Rsh18zINA9HuuDhrT0l+Uf5YcgwAEcgIIVg6ioUjrU2NbPs0sPGKESghQST8IIFiNjWP0x20OHNP8vcrnZ7wEAYNAkQCCVaQx3/TnJjR3gVl40AgQgMASAgjWEhzz2oj7qyV3RRvZw8o5V45BAAIjBKYSrJFj2JydwEkTqvidWbjDLF4uv0/+FSNAAAIZAQQrwzDPj7iHWiu+70qbS+wbEqmvKectcv/FnLcrxiAAARFAsARhzvapvL2Yx8Xo79p4ufxIebI/pwQxBIZOAMGa619A9Lcx+H1XLlZlDzo/pO4cJU/ml4cvTBtziWkEAi0mgGDNd3A+kjf3WB4XI38UZ+dCxqNKv0+OQQACOQEEKwdRfxR3URuHyN38LnaPi/7U4obSWusK1yjGIACBnACClYOYQ3RioY3l7rHyVyHfWihPEgI1EOhelQjWXMYs7qpm/PLO323lb1/YU9vjzMVq0iM7444jHwK9J4BgzWeIj8ub+bfice+90i7zN4siVk4Ch0AJAQSrBEq1WXFb1ZfupbpKaX9tjKKN7HDjtwaNAIFJBBCsSXQm7pt654dVckv5X+X+/OABikdNM7Cg2dVoNtsQgECRAIJVpFF5Om6lKo+Vu12tj4/Kt5MX7Ydm4RwjQAACyxJAsJZFNFOBj+noLeT/kO8rP0JetAfMwuut0RA1+4sHmsVz5dfLr5Ofl7vW07IvDBrtIY1DIBFAsBKJyuO4mar8kNzNF9rL7ljXupXvXolHrYnFCyQoUb5ePsO9WnE/tXyD/Hvyd8v3lu8jPyb3tYpvMYuXyL2sNgdpnHRLCCBY9Q3Eyap6E7mbz7I8LrrPrlYgNnFzicYHVMHP5EfL3ZRnLjCeXoFnoue/1PNjHbSbfDk7TAVUNn5bfVDb2U2wysIgMF8CCFYtvOPuqvYEeZn5TaPf1Q5/rlDRcha3kUj4OthvVPKL8ufJi+a3ShS3J6Sj1tSifwnwAxU6RV60s7XxQfnxufu2kkvsYG1pdme3q08uYH7JyMxLULD5EECwKucc/dLP/6l99lNWu38j+Eaz8HsbG/xSLVtT+qmK+C8++82mOyo9avcoY518gsWtJS6aIUV/Zc3fVPAMeXFW5bM874+EKpxlFiRUmft2MLNT5WW2nzLXyl247jeL6mP0B7uVhUGgHgLzEKx6et7KWn0B21wQXjqme37rggvEyO6oS8ZMpHzGcpd2SgTM15T8jvgdtF1mWluyI81CeqDaloa4s0REi+fm5bQG5WWXlPC+aA0trDELPuOz8hDUJ/OZlZcvL2ImUTSfBeqb0Ojlx5UjHwIzEUCwZsK30cGvUY6/eE9RZsV3Wd2nnAvNgtauLA9Rs5To3yTeqAwXqbWKy2ZSyl5iPqs6yiyMiF92yeezKRcon8H54rmLiRXCn5Q+TX6iWZgkQrYhhO/Ywk2th5qZr335OpqSpebnULqDTAjMSgDBmpXg0uP927aU4zeKFmdHd2vHdmZRM5ComU/0NSkXqdOVX7xE0+ai/W8xtSGhS7TgzyU+U3W9WX6AXJd78WYVSbMpiZa2lpqLk8+onm8WtH4VimJq04VwmVn4hNx/T3GNWXa56KLpl63azOxi9ccFM9vgAwJVEkCwKqMZ9Q3aYmW/Vepdcn+DqKLMXqlPrfPYWsU+8xknUi4s16qM1oXMb4dQctF8bUyCE+9QjovdFYq/L9elofmbSp9rGwetSZmELbhYed0bl5g6J6rffouDH+CzuyDxzS4p91COvhywXRV7XySY0c9VmxgEqiOAYFXCMvr6ja/zeG3+rd3JZkHrOTZhbciKwYXkncrwBXu/ZPS3O7gAKCuzmH2avUOxRMN2UjzOfObks5580Tx4fOW4wtPnx21VVjNDGyNGQf0OLtQqlplf5mYJPiBQFQEEqxqSHy9Uo5lFuHxhO2idyY5W2tec/HItXTqdrzwXKc16TMIUFAfP0+We6VtEG113Ciq/nPmPr2pdyjTTymY9PrOy6kLw+lN1E8QoeF916Rv8fFJ5YghUQgDBmhlj9FlHWijXZVpw0SjUGi4yC1pzCi9RrEsn/4cOmk1lIiXR8pmJKWSzNL+cUnpq89savqDSLnguEmeaBb91weoJIaheb2cZMQpFcdMhWC8JNHBSCNZM0LPLJL9Ey2sJ++eJ1URazJ542OPau17uszUJoGnRO2xvFk6QS/hsTgExmhNomikhgGCVQJk+a8k/7+enP660pL8rq2yHr0dJoMImZmELuaclWsHzjQCBIRFAsGYe7RBUhV8mjbmBU3unsiAhMn3rZreZmYuRFstNi/DBZ1ISKCNAYPAEEKxK/gTCytdsStsNWnQPLzYLLlJaNA9++4IRIACBBQII1gIHPiEAgQ4QQLA6MEh0EQIQWCCAYC1w4BMCNRKg6qoIIFhVkaQeCECgdgIIVu2IaQACEKiKAIJVFUnqgQAEaifQAcGqnQENQAACHSGAYHVkoOgmBCBghmDxVwABCHSGAILVmaEaREc5SQhMJIBgTcTDTghAoE0EEKw2jQZ9gQAEJhJAsCbiYScEIFAXgdXUi2CthhrHQAACjRBAsBrBTqMQgMBqCCBYq6HGMRCAQCMEEKxGsM/eKDVAYIgEEKwhjjrnDIGOEkCwOjpwdBsCQySAYA1x1DnnbhGgt4sEEKxFFCQgAIG2E0Cw2j5C9A8CEFgkgGAtoiABAQi0nUD/BavtI0D/IACBqQkgWFOjoiAEINA0AQSr6RGgfQhAYGoCCNbUqCjYfgL0sO8EEKy+jzDnB4EeEUCwejSYnAoE+k4Awer7CHN+EOgRgYJg9eisOBUIQKCXBBCsXg4rJwWBfhJAsPo5rpwVBHpJAMHq5bAue1IUgEAnCSBYnRw2Og2BYRJAsIY57pw1BDpJAMHq5LDRaQhMT6BPJRGsPo0m5wKBnhNAsHo+wJweBPpEAMHq02hyLhDoOQEEa5kBZjcEINAeAghWe8aCnkAAAssQQLCWAcRuCECgPQQQrPaMBT1pmgDtt54AgtX6IaKDEIBAIoBgJRLEEIBA6wkgWK0fIjoIAQgkAk8AAAD//5N+KycAAAAGSURBVAMA4CHvPK8blSUAAAAASUVORK5CYII=')
INSERT [dbo].[contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [tenant_name], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [landlord_name], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_signature]) VALUES (3, 74, 1006, 2, N'CT-015868-580', CAST(N'2026-06-29T00:00:00.000' AS DateTime), CAST(N'2026-12-29T00:00:00.000' AS DateTime), CAST(4000000.00 AS Decimal(10, 2)), CAST(4000000.00 AS Decimal(10, 2)), N'active', 1, N'', NULL, 0, NULL, CAST(N'2026-06-29T03:16:55.867' AS DateTime), CAST(N'2026-06-29T03:26:12.750' AS DateTime), N'Phương Dung', N'123456789034', CAST(N'2025-02-18' AS Date), N'cục cảnh sát', N'324 Nguyễn Hữu Thọ Đà Nẵng', N'Đức', N'123456789012', CAST(N'2024-06-26' AS Date), N'Cục Cảnh Sát', N'32 Nguyễn Văn Linh ', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782703562/signatures/gzin1tdvbt3pdpjeaxqy.png', N'data:image/png;base64,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')
INSERT [dbo].[contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [tenant_name], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [landlord_name], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_signature]) VALUES (4, 75, 1006, 2, N'CT-836488-566', CAST(N'2026-06-29T00:00:00.000' AS DateTime), CAST(N'2026-12-29T00:00:00.000' AS DateTime), CAST(4000000.00 AS Decimal(10, 2)), CAST(4000000.00 AS Decimal(10, 2)), N'active', 1, N'', NULL, 0, NULL, CAST(N'2026-06-29T03:47:16.487' AS DateTime), CAST(N'2026-06-29T03:49:58.827' AS DateTime), N'Hoàng Long', N'123243546572', CAST(N'2022-05-29' AS Date), N'Cục Cảnh Sát', N'123 lê thiện trị', N'Duc', N'123456789012', CAST(N'2024-06-27' AS Date), N'Cục Cảnh Sát Trật Tự và Xã Hội', N'58 Nguyễn Hữu Thọ,Hải Châu,Đà Nẵng', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782704989/signatures/kkt8jpzsd8lstshz34h0.png', N'data:image/png;base64,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')
INSERT [dbo].[contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [tenant_name], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [landlord_name], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_signature]) VALUES (6, 76, 1006, 2, N'CT-164258-312', CAST(N'2026-06-30T00:00:00.000' AS DateTime), CAST(N'2026-12-30T00:00:00.000' AS DateTime), CAST(4000000.00 AS Decimal(10, 2)), CAST(4000000.00 AS Decimal(10, 2)), N'active', 1, N'', NULL, 0, NULL, CAST(N'2026-06-29T08:02:44.257' AS DateTime), CAST(N'2026-06-29T08:05:50.863' AS DateTime), N'Dung', N'234567890123', CAST(N'2023-01-10' AS Date), N'cucj ', N'asdfgh', N'Duc', N'123456789012', CAST(N'2024-06-27' AS Date), N'Cục Cảnh Sát Trật Tự và Xã Hội', N'58 Nguyễn Hữu Thọ,Hải Châu,Đà Nẵng', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782720223/signatures/to6x6uomoozthy5xgchv.png', N'data:image/png;base64,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')
INSERT [dbo].[contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [tenant_name], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [landlord_name], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_signature]) VALUES (7, 77, 1006, 1010, N'CT-185122-024', CAST(N'2026-06-30T00:00:00.000' AS DateTime), CAST(N'2026-12-30T00:00:00.000' AS DateTime), CAST(5000000.00 AS Decimal(10, 2)), CAST(5000000.00 AS Decimal(10, 2)), N'draft', 0, NULL, NULL, 0, NULL, CAST(N'2026-06-29T08:19:45.123' AS DateTime), CAST(N'2026-06-29T08:19:45.123' AS DateTime), N'Phương Dung', N'123456789023', CAST(N'2024-01-23' AS Date), N'Cục', N'123 sdgfg', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[contracts] OFF
GO
SET IDENTITY_INSERT [dbo].[facilities] ON 

INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (1, N'WiFi', N'room', N'utility', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (2, N'Air Conditioner', N'room', N'appliance', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (3, N'Parking', N'room', N'utility', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (4, N'Private Bathroom', N'room', N'utility', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (5, N'Balcony', N'room', N'utility', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (6, N'Bed', N'room', N'furniture', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (7, N'Wardrobe', N'room', N'furniture', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (8, N'Kitchen', N'room', N'utility', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (9, N'Security Camera', N'room', N'security', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (10, N'Near University', N'nearby', N'education', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (11, N'Near Hospital', N'nearby', N'hospital', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (12, N'Near Supermarket', N'nearby', N'shopping', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (13, N'Near Bus Station', N'nearby', N'transport', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (14, N'Near Market', N'nearby', N'shopping', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (15, N'Near Park', N'nearby', N'recreation', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
INSERT [dbo].[facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (16, N'Near Convenience Store', N'nearby', N'shopping', CAST(N'2026-06-28T21:56:28.337' AS DateTime))
SET IDENTITY_INSERT [dbo].[facilities] OFF
GO
SET IDENTITY_INSERT [dbo].[notifications] ON 

INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (1, 2, N'Listing Approved', N'Good news! Your listing "dfgd" has been approved and is now live.', N'system', 3, 0, NULL, CAST(N'2026-06-28T15:55:30.803' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (2, 2, N'Listing Approved', N'Good news! Your listing "1dug" has been approved and is now live.', N'system', 66, 0, NULL, CAST(N'2026-06-28T16:05:18.963' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (3, 2, N'New Rental Request', N'You have a new rental request for 1dug.', N'rental_request', 1, 0, NULL, CAST(N'2026-06-28T16:05:38.603' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (4, 1006, N'Rental Request Approved', N'Your rental request for 1dug has been approved!', N'rental_request', 1, 0, NULL, CAST(N'2026-06-28T16:05:55.490' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (5, 2, N'Contract Requested', N'Tenant has requested a contract for "1dug".', N'contract', 2, 0, NULL, CAST(N'2026-06-28T16:22:33.460' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (6, 2, N'New Rental Request', N'You have a new rental request for 1dug.', N'rental_request', 2, 0, NULL, CAST(N'2026-06-28T16:26:29.887' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (7, 1006, N'Rental Request Approved', N'Your rental request for 1dug has been approved!', N'rental_request', 2, 0, NULL, CAST(N'2026-06-28T16:27:02.373' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (8, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for 1dug. Please review, sign, and pay the deposit.', N'contract', 2, 0, NULL, CAST(N'2026-06-28T16:28:33.117' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (9, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "1dug". Waiting for deposit payment.', N'contract', 2, 0, NULL, CAST(N'2026-06-28T16:28:45.360' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (10, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "1dug". The rental is now active.', N'contract', 2, 0, NULL, CAST(N'2026-06-28T16:34:41.697' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (11, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "1dug". The rental is now active.', N'contract', 2, 0, NULL, CAST(N'2026-06-28T16:34:41.747' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (12, 2, N'Listing Approved', N'Good news! Your listing "tfvghfg" has been approved and is now live.', N'system', 76, 0, NULL, CAST(N'2026-06-29T03:13:21.383' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (13, 2, N'Listing Approved', N'Good news! Your listing "tfvghfg" has been approved and is now live.', N'system', 75, 0, NULL, CAST(N'2026-06-29T03:13:25.560' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (14, 2, N'Listing Approved', N'Good news! Your listing "fsgs" has been approved and is now live.', N'system', 74, 0, NULL, CAST(N'2026-06-29T03:13:28.927' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (15, 2, N'New Rental Request', N'You have a new rental request for fsgs.', N'rental_request', 3, 0, NULL, CAST(N'2026-06-29T03:14:10.193' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (16, 1006, N'Rental Request Approved', N'Your rental request for fsgs has been approved!', N'rental_request', 3, 0, NULL, CAST(N'2026-06-29T03:14:26.053' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (17, 2, N'Contract Requested', N'Tenant has requested a contract for "fsgs".', N'contract', 3, 0, NULL, CAST(N'2026-06-29T03:16:55.903' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (18, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for fsgs. Please review, sign, and pay the deposit.', N'contract', 3, 0, NULL, CAST(N'2026-06-29T03:26:03.517' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (19, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "fsgs". Waiting for deposit payment.', N'contract', 3, 0, NULL, CAST(N'2026-06-29T03:26:12.783' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (20, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "fsgs". The rental is now active.', N'contract', 3, 0, NULL, CAST(N'2026-06-29T03:28:12.657' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (21, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "fsgs". The rental is now active.', N'contract', 3, 0, NULL, CAST(N'2026-06-29T03:28:12.703' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (22, 2, N'New Rental Request', N'You have a new rental request for tfvghfg.', N'rental_request', 4, 0, NULL, CAST(N'2026-06-29T03:46:10.340' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (23, 1006, N'Rental Request Approved', N'Your rental request for tfvghfg has been approved!', N'rental_request', 4, 0, NULL, CAST(N'2026-06-29T03:46:16.780' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (24, 2, N'Contract Requested', N'Tenant has requested a contract for "tfvghfg".', N'contract', 4, 0, NULL, CAST(N'2026-06-29T03:47:16.520' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (25, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for tfvghfg. Please review, sign, and pay the deposit.', N'contract', 4, 0, NULL, CAST(N'2026-06-29T03:49:49.837' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (26, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "tfvghfg". Waiting for deposit payment.', N'contract', 4, 0, NULL, CAST(N'2026-06-29T03:49:58.857' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (27, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 4, 0, NULL, CAST(N'2026-06-29T03:50:36.860' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (28, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 4, 0, NULL, CAST(N'2026-06-29T03:50:36.897' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (29, 1010, N'Listing Approved', N'Good news! Your listing "gdgd" has been approved and is now live.', N'system', 77, 0, NULL, CAST(N'2026-06-29T03:57:39.333' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (30, 1010, N'New Rental Request', N'You have a new rental request for gdgd.', N'rental_request', 5, 0, NULL, CAST(N'2026-06-29T03:57:46.243' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (31, 1006, N'Rental Request Approved', N'Your rental request for gdgd has been approved!', N'rental_request', 5, 0, NULL, CAST(N'2026-06-29T03:57:53.473' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (32, 1010, N'Contract Requested', N'Tenant has requested a contract for "gdgd".', N'contract', 5, 0, NULL, CAST(N'2026-06-29T03:58:48.933' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (33, 2, N'New Rental Request', N'You have a new rental request for tfvghfg.', N'rental_request', 6, 0, NULL, CAST(N'2026-06-29T08:00:07.980' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (34, 1006, N'Rental Request Rejected', N'Your rental request for tfvghfg has been rejected. Reason: hongr', N'rental_request', 6, 0, NULL, CAST(N'2026-06-29T08:00:46.970' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (35, 2, N'New Rental Request', N'You have a new rental request for tfvghfg.', N'rental_request', 7, 0, NULL, CAST(N'2026-06-29T08:01:27.447' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (36, 1006, N'Rental Request Approved', N'Your rental request for tfvghfg has been approved!', N'rental_request', 7, 0, NULL, CAST(N'2026-06-29T08:01:51.917' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (37, 2, N'Contract Requested', N'Tenant has requested a contract for "tfvghfg".', N'contract', 6, 0, NULL, CAST(N'2026-06-29T08:02:44.307' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (38, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for tfvghfg. Please review, sign, and pay the deposit.', N'contract', 6, 0, NULL, CAST(N'2026-06-29T08:03:44.560' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (39, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "tfvghfg". Waiting for deposit payment.', N'contract', 6, 0, NULL, CAST(N'2026-06-29T08:05:50.920' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (40, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 6, 0, NULL, CAST(N'2026-06-29T08:06:47.913' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (41, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 6, 0, NULL, CAST(N'2026-06-29T08:06:48.067' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (42, 1010, N'New Rental Request', N'You have a new rental request for gdgd.', N'rental_request', 8, 0, NULL, CAST(N'2026-06-29T08:11:08.650' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (43, 1006, N'Rental Request Approved', N'Your rental request for gdgd has been approved!', N'rental_request', 8, 0, NULL, CAST(N'2026-06-29T08:11:22.317' AS DateTime))
INSERT [dbo].[notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (44, 1010, N'Contract Requested', N'Tenant has requested a contract for "gdgd".', N'contract', 7, 0, NULL, CAST(N'2026-06-29T08:19:45.197' AS DateTime))
SET IDENTITY_INSERT [dbo].[notifications] OFF
GO
SET IDENTITY_INSERT [dbo].[otp_verifications] ON 

INSERT [dbo].[otp_verifications] ([otp_id], [user_id], [otp_code], [purpose], [expired_at], [is_used]) VALUES (3, 1010, N'987104', N'verify_email', CAST(N'2026-06-29T03:58:46.180' AS DateTime), 1)
SET IDENTITY_INSERT [dbo].[otp_verifications] OFF
GO
SET IDENTITY_INSERT [dbo].[payments] ON 

INSERT [dbo].[payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (1, 2, 1006, 2, 66, NULL, CAST(4000000.00 AS Decimal(10, 2)), N'deposit', N'completed', N'vnpay', N'15602243', NULL, CAST(N'2026-06-28T16:34:41.723' AS DateTime), NULL, CAST(200000.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), CAST(3800000.00 AS Decimal(10, 2)), N'completed', CAST(N'2026-06-28T16:35:44.470' AS DateTime), CAST(N'2026-06-28T16:32:55.743' AS DateTime), CAST(N'2026-06-28T16:34:41.723' AS DateTime))
INSERT [dbo].[payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (2, 3, 1006, 2, 74, NULL, CAST(8000000.00 AS Decimal(10, 2)), N'deposit', N'completed', N'vnpay', N'15602583', NULL, CAST(N'2026-06-29T03:28:12.690' AS DateTime), NULL, CAST(400000.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), CAST(7600000.00 AS Decimal(10, 2)), N'completed', CAST(N'2026-06-29T03:28:52.560' AS DateTime), CAST(N'2026-06-29T03:26:15.383' AS DateTime), CAST(N'2026-06-29T03:28:12.690' AS DateTime))
INSERT [dbo].[payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (3, 4, 1006, 2, 75, NULL, CAST(8000000.00 AS Decimal(10, 2)), N'deposit', N'completed', N'vnpay', N'15602655', NULL, CAST(N'2026-06-29T03:50:36.880' AS DateTime), NULL, CAST(400000.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), CAST(7600000.00 AS Decimal(10, 2)), N'completed', CAST(N'2026-06-29T03:51:43.913' AS DateTime), CAST(N'2026-06-29T03:50:00.707' AS DateTime), CAST(N'2026-06-29T03:50:36.880' AS DateTime))
INSERT [dbo].[payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (4, 6, 1006, 2, 76, NULL, CAST(8000000.00 AS Decimal(10, 2)), N'deposit', N'completed', N'vnpay', N'15603145', NULL, CAST(N'2026-06-29T08:06:47.990' AS DateTime), NULL, CAST(400000.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), CAST(7600000.00 AS Decimal(10, 2)), N'completed', CAST(N'2026-06-29T08:07:12.607' AS DateTime), CAST(N'2026-06-29T08:05:56.987' AS DateTime), CAST(N'2026-06-29T08:06:47.990' AS DateTime))
SET IDENTITY_INSERT [dbo].[payments] OFF
GO
SET IDENTITY_INSERT [dbo].[properties] ON 

INSERT [dbo].[properties] ([property_id], [landlord_id], [name], [description], [address], [city], [district], [ward], [total_floors], [thumbnail_url], [status], [is_deleted], [created_at], [updated_at]) VALUES (1, 2, N'Nhà Trọ Kha', N'Thân Thiện', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782659496/rental_rooms/m3njff9kuhmma8gq3t9c.png', N'active', 0, CAST(N'2026-06-28T15:11:38.620' AS DateTime), CAST(N'2026-06-28T15:11:38.620' AS DateTime))
INSERT [dbo].[properties] ([property_id], [landlord_id], [name], [description], [address], [city], [district], [ward], [total_floors], [thumbnail_url], [status], [is_deleted], [created_at], [updated_at]) VALUES (2, 2, N'Test Building', N'', N'123 Test St', N'Tỉnh An Giang', N'Huyện An Phú', N'', 2, NULL, N'active', 1, CAST(N'2026-06-28T15:38:55.730' AS DateTime), CAST(N'2026-06-28T15:52:35.017' AS DateTime))
INSERT [dbo].[properties] ([property_id], [landlord_id], [name], [description], [address], [city], [district], [ward], [total_floors], [thumbnail_url], [status], [is_deleted], [created_at], [updated_at]) VALUES (3, 2, N'Test Building 2', N'', N'456 Test St', N'Tỉnh An Giang', N'Huyện An Phú', N'', 2, NULL, N'active', 1, CAST(N'2026-06-28T15:49:42.233' AS DateTime), CAST(N'2026-06-28T15:52:38.747' AS DateTime))
INSERT [dbo].[properties] ([property_id], [landlord_id], [name], [description], [address], [city], [district], [ward], [total_floors], [thumbnail_url], [status], [is_deleted], [created_at], [updated_at]) VALUES (4, 2, N'Nhà Trọ Khôi', N'sgsgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 5, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699768/rental_rooms/zfyyugsb4jy3nioysrkk.png', N'active', 0, CAST(N'2026-06-29T02:22:49.243' AS DateTime), CAST(N'2026-06-29T02:22:49.243' AS DateTime))
SET IDENTITY_INSERT [dbo].[properties] OFF
GO
SET IDENTITY_INSERT [dbo].[rental_requests] ON 

INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (1, 66, 1006, 2, N'completed', CAST(N'2026-06-28T00:00:00.000' AS DateTime), 3, NULL, NULL, CAST(N'2026-06-28T16:05:38.583' AS DateTime), CAST(N'2026-06-28T16:28:45.350' AS DateTime))
INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (2, 66, 1006, 2, N'approved', NULL, NULL, NULL, NULL, CAST(N'2026-06-28T16:26:29.870' AS DateTime), CAST(N'2026-06-28T09:27:02.000' AS DateTime))
INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (3, 74, 1006, 2, N'completed', CAST(N'2026-06-29T00:00:00.000' AS DateTime), 6, NULL, NULL, CAST(N'2026-06-29T03:14:10.177' AS DateTime), CAST(N'2026-06-29T03:26:12.777' AS DateTime))
INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (4, 75, 1006, 2, N'completed', CAST(N'2026-06-29T00:00:00.000' AS DateTime), 6, NULL, NULL, CAST(N'2026-06-29T03:46:10.323' AS DateTime), CAST(N'2026-06-29T03:49:58.850' AS DateTime))
INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (6, 76, 1006, 2, N'rejected', NULL, NULL, NULL, N'hongr', CAST(N'2026-06-29T08:00:07.930' AS DateTime), CAST(N'2026-06-29T01:00:46.000' AS DateTime))
INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (7, 76, 1006, 2, N'completed', CAST(N'2026-06-30T00:00:00.000' AS DateTime), 6, NULL, NULL, CAST(N'2026-06-29T08:01:27.430' AS DateTime), CAST(N'2026-06-29T08:05:50.907' AS DateTime))
INSERT [dbo].[rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (8, 77, 1006, 1010, N'contract_requested', CAST(N'2026-06-30T00:00:00.000' AS DateTime), 6, NULL, NULL, CAST(N'2026-06-29T08:11:08.623' AS DateTime), CAST(N'2026-06-29T01:19:45.000' AS DateTime))
SET IDENTITY_INSERT [dbo].[rental_requests] OFF
GO
SET IDENTITY_INSERT [dbo].[roles] ON 

INSERT [dbo].[roles] ([role_id], [role_name], [description]) VALUES (1, N'Admin', N'System Administrator with full access')
INSERT [dbo].[roles] ([role_id], [role_name], [description]) VALUES (2, N'Landlord', N'Property Owner who manages boarding houses & listings')
INSERT [dbo].[roles] ([role_id], [role_name], [description]) VALUES (3, N'Tenant', N'Renters who search rooms, sign contracts, and send requests')
SET IDENTITY_INSERT [dbo].[roles] OFF
GO
SET IDENTITY_INSERT [dbo].[room_facilities] ON 

INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1, 2, 1, CAST(N'2026-06-28T15:51:44.970' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (2, 2, 2, CAST(N'2026-06-28T15:51:45.007' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (3, 2, 3, CAST(N'2026-06-28T15:51:45.037' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1012, 66, 1, CAST(N'2026-06-28T16:05:10.253' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1013, 66, 2, CAST(N'2026-06-28T16:05:10.307' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1014, 66, 3, CAST(N'2026-06-28T16:05:10.347' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1015, 66, 4, CAST(N'2026-06-28T16:05:10.373' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1016, 66, 5, CAST(N'2026-06-28T16:05:10.397' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1017, 66, 6, CAST(N'2026-06-28T16:05:10.420' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1018, 66, 7, CAST(N'2026-06-28T16:05:10.447' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1019, 66, 8, CAST(N'2026-06-28T16:05:10.477' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1020, 66, 9, CAST(N'2026-06-28T16:05:10.517' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1021, 66, 10, CAST(N'2026-06-28T16:05:10.540' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1022, 66, 11, CAST(N'2026-06-28T16:05:10.563' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1023, 66, 12, CAST(N'2026-06-28T16:05:10.587' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1024, 66, 13, CAST(N'2026-06-28T16:05:10.610' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1025, 66, 14, CAST(N'2026-06-28T16:05:10.630' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1026, 66, 15, CAST(N'2026-06-28T16:05:10.653' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1027, 66, 16, CAST(N'2026-06-28T16:05:10.680' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1028, 67, 1, CAST(N'2026-06-28T16:25:37.380' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1029, 67, 2, CAST(N'2026-06-28T16:25:37.387' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1030, 67, 3, CAST(N'2026-06-28T16:25:37.390' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1031, 67, 4, CAST(N'2026-06-28T16:25:37.393' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1032, 67, 5, CAST(N'2026-06-28T16:25:37.397' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1033, 67, 6, CAST(N'2026-06-28T16:25:37.400' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1034, 67, 7, CAST(N'2026-06-28T16:25:37.407' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1035, 67, 8, CAST(N'2026-06-28T16:25:37.410' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1036, 67, 9, CAST(N'2026-06-28T16:25:37.413' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1037, 67, 10, CAST(N'2026-06-28T16:25:37.417' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1038, 67, 11, CAST(N'2026-06-28T16:25:37.420' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1039, 67, 12, CAST(N'2026-06-28T16:25:37.423' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1040, 67, 13, CAST(N'2026-06-28T16:25:37.427' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1041, 67, 14, CAST(N'2026-06-28T16:25:37.430' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1042, 67, 15, CAST(N'2026-06-28T16:25:37.430' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1043, 67, 16, CAST(N'2026-06-28T16:25:37.433' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1044, 68, 1, CAST(N'2026-06-29T02:25:33.957' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1045, 68, 2, CAST(N'2026-06-29T02:25:33.990' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1046, 68, 3, CAST(N'2026-06-29T02:25:34.017' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1047, 68, 4, CAST(N'2026-06-29T02:25:34.037' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1048, 68, 5, CAST(N'2026-06-29T02:25:34.057' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1049, 68, 6, CAST(N'2026-06-29T02:25:34.080' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1050, 68, 7, CAST(N'2026-06-29T02:25:34.100' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1051, 68, 8, CAST(N'2026-06-29T02:25:34.120' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1052, 68, 9, CAST(N'2026-06-29T02:25:34.140' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1053, 68, 10, CAST(N'2026-06-29T02:25:34.163' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1054, 68, 11, CAST(N'2026-06-29T02:25:34.183' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1055, 68, 12, CAST(N'2026-06-29T02:25:34.203' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1056, 68, 13, CAST(N'2026-06-29T02:25:34.223' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1057, 68, 14, CAST(N'2026-06-29T02:25:34.243' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1058, 68, 15, CAST(N'2026-06-29T02:25:34.260' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1059, 68, 16, CAST(N'2026-06-29T02:25:34.277' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1060, 69, 1, CAST(N'2026-06-29T02:37:19.823' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1061, 69, 2, CAST(N'2026-06-29T02:37:19.853' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1062, 69, 3, CAST(N'2026-06-29T02:37:19.877' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1063, 69, 4, CAST(N'2026-06-29T02:37:19.900' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1064, 69, 5, CAST(N'2026-06-29T02:37:19.923' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1065, 69, 6, CAST(N'2026-06-29T02:37:19.947' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1066, 69, 7, CAST(N'2026-06-29T02:37:19.980' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1067, 69, 8, CAST(N'2026-06-29T02:37:20.007' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1068, 69, 9, CAST(N'2026-06-29T02:37:20.030' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1069, 69, 10, CAST(N'2026-06-29T02:37:20.057' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1070, 69, 11, CAST(N'2026-06-29T02:37:20.083' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1071, 69, 12, CAST(N'2026-06-29T02:37:20.107' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1072, 69, 13, CAST(N'2026-06-29T02:37:20.133' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1073, 69, 14, CAST(N'2026-06-29T02:37:20.160' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1074, 69, 15, CAST(N'2026-06-29T02:37:20.180' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1075, 69, 16, CAST(N'2026-06-29T02:37:20.203' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1076, 70, 1, CAST(N'2026-06-29T02:38:08.203' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1077, 70, 2, CAST(N'2026-06-29T02:38:08.210' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1078, 70, 3, CAST(N'2026-06-29T02:38:08.210' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1079, 70, 4, CAST(N'2026-06-29T02:38:08.213' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1080, 70, 5, CAST(N'2026-06-29T02:38:08.217' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1081, 70, 6, CAST(N'2026-06-29T02:38:08.217' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1082, 70, 7, CAST(N'2026-06-29T02:38:08.220' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1083, 70, 8, CAST(N'2026-06-29T02:38:08.223' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1084, 70, 9, CAST(N'2026-06-29T02:38:08.223' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1085, 70, 10, CAST(N'2026-06-29T02:38:08.227' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1086, 70, 11, CAST(N'2026-06-29T02:38:08.230' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1087, 70, 12, CAST(N'2026-06-29T02:38:08.230' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1088, 70, 13, CAST(N'2026-06-29T02:38:08.233' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1089, 70, 14, CAST(N'2026-06-29T02:38:08.237' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1090, 70, 15, CAST(N'2026-06-29T02:38:08.237' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1091, 70, 16, CAST(N'2026-06-29T02:38:08.240' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1092, 71, 1, CAST(N'2026-06-29T02:41:10.097' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1093, 71, 2, CAST(N'2026-06-29T02:41:10.107' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1094, 71, 3, CAST(N'2026-06-29T02:41:10.117' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1095, 71, 4, CAST(N'2026-06-29T02:41:10.120' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1096, 71, 5, CAST(N'2026-06-29T02:41:10.127' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1097, 71, 6, CAST(N'2026-06-29T02:41:10.130' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1098, 71, 7, CAST(N'2026-06-29T02:41:10.133' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1099, 71, 8, CAST(N'2026-06-29T02:41:10.137' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1100, 71, 9, CAST(N'2026-06-29T02:41:10.140' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1101, 71, 10, CAST(N'2026-06-29T02:41:10.140' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1102, 71, 11, CAST(N'2026-06-29T02:41:10.143' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1103, 71, 12, CAST(N'2026-06-29T02:41:10.143' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1104, 71, 13, CAST(N'2026-06-29T02:41:10.147' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1105, 71, 14, CAST(N'2026-06-29T02:41:10.160' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1106, 71, 15, CAST(N'2026-06-29T02:41:10.177' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1107, 71, 16, CAST(N'2026-06-29T02:41:10.197' AS DateTime))
GO
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1108, 72, 1, CAST(N'2026-06-29T02:47:49.037' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1109, 72, 2, CAST(N'2026-06-29T02:47:49.050' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1110, 72, 3, CAST(N'2026-06-29T02:47:49.053' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1111, 72, 4, CAST(N'2026-06-29T02:47:49.057' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1112, 72, 5, CAST(N'2026-06-29T02:47:49.063' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1113, 72, 6, CAST(N'2026-06-29T02:47:49.067' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1114, 72, 7, CAST(N'2026-06-29T02:47:49.070' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1115, 72, 8, CAST(N'2026-06-29T02:47:49.073' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1116, 72, 9, CAST(N'2026-06-29T02:47:49.077' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1117, 72, 10, CAST(N'2026-06-29T02:47:49.077' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1118, 72, 11, CAST(N'2026-06-29T02:47:49.080' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1119, 72, 12, CAST(N'2026-06-29T02:47:49.083' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1120, 72, 13, CAST(N'2026-06-29T02:47:49.087' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1121, 72, 14, CAST(N'2026-06-29T02:47:49.087' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1122, 72, 15, CAST(N'2026-06-29T02:47:49.090' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1123, 72, 16, CAST(N'2026-06-29T02:47:49.093' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1124, 73, 1, CAST(N'2026-06-29T02:48:18.090' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1125, 73, 2, CAST(N'2026-06-29T02:48:18.100' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1126, 73, 3, CAST(N'2026-06-29T02:48:18.103' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1127, 73, 4, CAST(N'2026-06-29T02:48:18.107' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1128, 73, 5, CAST(N'2026-06-29T02:48:18.110' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1129, 73, 6, CAST(N'2026-06-29T02:48:18.113' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1130, 73, 7, CAST(N'2026-06-29T02:48:18.117' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1131, 73, 8, CAST(N'2026-06-29T02:48:18.120' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1132, 73, 9, CAST(N'2026-06-29T02:48:18.123' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1133, 73, 10, CAST(N'2026-06-29T02:48:18.123' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1134, 73, 11, CAST(N'2026-06-29T02:48:18.127' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1135, 73, 12, CAST(N'2026-06-29T02:48:18.130' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1136, 73, 13, CAST(N'2026-06-29T02:48:18.133' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1137, 73, 14, CAST(N'2026-06-29T02:48:18.133' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1138, 73, 15, CAST(N'2026-06-29T02:48:18.137' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1139, 73, 16, CAST(N'2026-06-29T02:48:18.140' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1140, 74, 1, CAST(N'2026-06-29T02:48:18.143' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1141, 74, 2, CAST(N'2026-06-29T02:48:18.147' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1142, 74, 3, CAST(N'2026-06-29T02:48:18.157' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1143, 74, 4, CAST(N'2026-06-29T02:48:18.157' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1144, 74, 5, CAST(N'2026-06-29T02:48:18.160' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1145, 74, 6, CAST(N'2026-06-29T02:48:18.160' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1146, 74, 7, CAST(N'2026-06-29T02:48:18.163' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1147, 74, 8, CAST(N'2026-06-29T02:48:18.167' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1148, 74, 9, CAST(N'2026-06-29T02:48:18.167' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1149, 74, 10, CAST(N'2026-06-29T02:48:18.170' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1150, 74, 11, CAST(N'2026-06-29T02:48:18.173' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1151, 74, 12, CAST(N'2026-06-29T02:48:18.177' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1152, 74, 13, CAST(N'2026-06-29T02:48:18.177' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1153, 74, 14, CAST(N'2026-06-29T02:48:18.180' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1154, 74, 15, CAST(N'2026-06-29T02:48:18.180' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1155, 74, 16, CAST(N'2026-06-29T02:48:18.183' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1156, 75, 1, CAST(N'2026-06-29T02:48:35.243' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1157, 75, 2, CAST(N'2026-06-29T02:48:35.253' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1158, 75, 3, CAST(N'2026-06-29T02:48:35.260' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1159, 75, 4, CAST(N'2026-06-29T02:48:35.263' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1160, 75, 5, CAST(N'2026-06-29T02:48:35.267' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1161, 75, 6, CAST(N'2026-06-29T02:48:35.270' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1162, 75, 7, CAST(N'2026-06-29T02:48:35.273' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1163, 75, 8, CAST(N'2026-06-29T02:48:35.277' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1164, 75, 9, CAST(N'2026-06-29T02:48:35.280' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1165, 75, 10, CAST(N'2026-06-29T02:48:35.283' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1166, 75, 11, CAST(N'2026-06-29T02:48:35.287' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1167, 75, 12, CAST(N'2026-06-29T02:48:35.290' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1168, 75, 13, CAST(N'2026-06-29T02:48:35.297' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1169, 75, 14, CAST(N'2026-06-29T02:48:35.297' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1170, 75, 15, CAST(N'2026-06-29T02:48:35.303' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1171, 75, 16, CAST(N'2026-06-29T02:48:35.307' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1172, 76, 1, CAST(N'2026-06-29T02:48:35.317' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1173, 76, 2, CAST(N'2026-06-29T02:48:35.317' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1174, 76, 3, CAST(N'2026-06-29T02:48:35.320' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1175, 76, 4, CAST(N'2026-06-29T02:48:35.327' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1176, 76, 5, CAST(N'2026-06-29T02:48:35.327' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1177, 76, 6, CAST(N'2026-06-29T02:48:35.330' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1178, 76, 7, CAST(N'2026-06-29T02:48:35.333' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1179, 76, 8, CAST(N'2026-06-29T02:48:35.337' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1180, 76, 9, CAST(N'2026-06-29T02:48:35.340' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1181, 76, 10, CAST(N'2026-06-29T02:48:35.343' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1182, 76, 11, CAST(N'2026-06-29T02:48:35.347' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1183, 76, 12, CAST(N'2026-06-29T02:48:35.350' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1184, 76, 13, CAST(N'2026-06-29T02:48:35.353' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1185, 76, 14, CAST(N'2026-06-29T02:48:35.353' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1186, 76, 15, CAST(N'2026-06-29T02:48:35.357' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1187, 76, 16, CAST(N'2026-06-29T02:48:35.360' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1188, 77, 1, CAST(N'2026-06-29T03:57:22.067' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1189, 77, 2, CAST(N'2026-06-29T03:57:22.100' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1190, 77, 4, CAST(N'2026-06-29T03:57:22.123' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1191, 77, 5, CAST(N'2026-06-29T03:57:22.147' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1192, 77, 6, CAST(N'2026-06-29T03:57:22.177' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1193, 77, 7, CAST(N'2026-06-29T03:57:22.210' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1194, 77, 8, CAST(N'2026-06-29T03:57:22.237' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1195, 77, 9, CAST(N'2026-06-29T03:57:22.263' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1196, 77, 10, CAST(N'2026-06-29T03:57:22.297' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1197, 77, 11, CAST(N'2026-06-29T03:57:22.320' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1198, 77, 12, CAST(N'2026-06-29T03:57:22.343' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1199, 77, 13, CAST(N'2026-06-29T03:57:22.367' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1200, 77, 14, CAST(N'2026-06-29T03:57:22.387' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1201, 77, 15, CAST(N'2026-06-29T03:57:22.413' AS DateTime))
INSERT [dbo].[room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1202, 77, 16, CAST(N'2026-06-29T03:57:22.430' AS DateTime))
SET IDENTITY_INSERT [dbo].[room_facilities] OFF
GO
SET IDENTITY_INSERT [dbo].[room_images] ON 

INSERT [dbo].[room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (2, 66, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', 1, 0, CAST(N'2026-06-28T16:05:10.190' AS DateTime))
INSERT [dbo].[room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (3, 68, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', 1, 0, CAST(N'2026-06-29T02:25:33.907' AS DateTime))
INSERT [dbo].[room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (4, 69, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', 1, 0, CAST(N'2026-06-29T02:37:19.793' AS DateTime))
INSERT [dbo].[room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (5, 77, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782705441/rental_rooms/f1o8438tcwukkqhhyyoo.png', 1, 0, CAST(N'2026-06-29T03:57:22.020' AS DateTime))
SET IDENTITY_INSERT [dbo].[room_images] OFF
GO
SET IDENTITY_INSERT [dbo].[rooms] ON 

INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (1, 2, 1, 1, NULL, N'Test Room', NULL, N'123 Test', N'Test City', NULL, NULL, CAST(3000000.00 AS Decimal(10, 2)), NULL, N'private_room', 1, 4, N'pending', NULL, NULL, 1, CAST(N'2026-06-28T15:54:04.833' AS DateTime), CAST(N'2026-06-28T15:45:29.497' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (2, 2, 3, 1, NULL, N'Test Room 2', N'This is a test room in the test building.', N'456 Test St', N'Tỉnh An Giang', N'Huyện Phú Tân', NULL, CAST(3000000.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(8, 2)), N'private_room', 1, 4, N'pending', NULL, NULL, 1, CAST(N'2026-06-28T15:52:38.750' AS DateTime), CAST(N'2026-06-28T15:51:44.903' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (66, 2, 1, 1, N'101', N'Phòng 25m2', N'tối đa 2 người ở', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, CAST(2000000.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', NULL, 0, CAST(N'2026-06-28T16:52:14.163' AS DateTime), CAST(N'2026-06-28T16:05:10.157' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (67, 2, 1, 1, N'102', N'1dug', N'dgdg', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(2000000.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', NULL, 1, CAST(N'2026-06-28T16:26:45.613' AS DateTime), CAST(N'2026-06-28T16:25:37.367' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (68, 2, 4, 1, N'101', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 0, CAST(N'2026-06-29T02:25:33.877' AS DateTime), CAST(N'2026-06-29T02:25:33.877' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (69, 2, 4, 1, N'102', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, CAST(N'2026-06-29T02:37:19.763' AS DateTime), CAST(N'2026-06-29T02:37:19.763' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (70, 2, 4, 5, N'501', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, CAST(N'2026-06-29T02:38:08.193' AS DateTime), CAST(N'2026-06-29T02:38:08.193' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (71, 2, 1, 2, N'201', N'Phòng 25m2', N'tối đa 2 người ở', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(2000000.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', NULL, 0, CAST(N'2026-06-29T02:41:10.080' AS DateTime), CAST(N'2026-06-29T02:41:10.080' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (72, 2, 4, 2, N'203.206', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 1, CAST(N'2026-06-29T02:48:04.053' AS DateTime), CAST(N'2026-06-29T02:47:49.013' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (73, 2, 4, 2, N'203', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 0, CAST(N'2026-06-29T02:48:18.077' AS DateTime), CAST(N'2026-06-29T02:48:18.077' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (74, 2, 4, 2, N'206', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 0, CAST(N'2026-06-29T02:48:18.140' AS DateTime), CAST(N'2026-06-29T02:48:18.140' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (75, 2, 4, 4, N'401', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, CAST(N'2026-06-29T02:48:35.230' AS DateTime), CAST(N'2026-06-29T02:48:35.230' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (76, 2, 4, 4, N'402', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', CAST(4000000.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(8, 2)), N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, CAST(N'2026-06-29T02:48:35.310' AS DateTime), CAST(N'2026-06-29T02:48:35.310' AS DateTime))
INSERT [dbo].[rooms] ([room_id], [landlord_id], [property_id], [floor], [room_number], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [updated_at], [created_at]) VALUES (77, 1010, NULL, NULL, N'Nguyên Can', N'gdgd', N'dfgdg', N'56 doãn uẩn', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, CAST(5000000.00 AS Decimal(10, 2)), CAST(40.00 AS Decimal(8, 2)), N'private_room', 1, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782705441/rental_rooms/f1o8438tcwukkqhhyyoo.png', NULL, 0, CAST(N'2026-06-29T03:57:21.990' AS DateTime), CAST(N'2026-06-29T03:57:21.990' AS DateTime))
SET IDENTITY_INSERT [dbo].[rooms] OFF
GO
SET IDENTITY_INSERT [dbo].[users] ON 

INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1, N'Đức Trần', N'ductran281206@gmail.com', N'$2b$12$.ZGsNZB7D3TUrj0HlUzz9ewAVDP2IfPsmxUtvoU45Whzu36f4qiFC', NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocLEh19aZ_gZpyAvEEaezF40fpkJ5USMN8HU5oeEswc0Ed5vcXGM=s96-c', N'107547421603725758963', 1, 0, 0, CAST(N'2026-06-12T02:25:34.000' AS DateTime), CAST(N'2026-06-21T21:14:38.687' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (2, N'Duc', N'williamlata01@gmail.com', N'$2b$12$1NZ.anBIqI4QVFP9M6ot3O7zfCy7fR0LBMMjcxQ5NHDgWB9rRUzN2', N'0968902029', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117675/rental_rooms/ypzdgtlz7zj8pm9wftkm.jpg', NULL, 1, 0, 0, CAST(N'2026-06-12T02:26:49.000' AS DateTime), CAST(N'2026-06-29T10:45:32.553' AS DateTime), N'123456789012', CAST(N'2024-06-27' AS Date), N'Cục Cảnh Sát Trật Tự và Xã Hội', N'58 Nguyễn Hữu Thọ,Hải Châu,Đà Nẵng')
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1002, N'System Administrator', N'admin@smartroom.com', N'$2b$12$qnO3.m20cjJDkqY5uVUlneDfhtX1PuuKEQ8e1ZY1V4SMpsTF7hcEa', NULL, 1, NULL, NULL, 1, 0, 0, CAST(N'2026-06-13T06:22:55.000' AS DateTime), CAST(N'2026-06-13T06:22:55.000' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1003, N'Hai', N'ductran28122k6@gmail.com', N'$2b$12$7C1V2UOpw30flZsRKDA5c.7U8h2AgW7TwssT9XOBpgTdHDVYi0K0S', N'0925134567', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109099/rental_rooms/xg0ysluci3ijemuxuoi5.png', NULL, 1, 0, 0, CAST(N'2026-06-13T07:39:46.000' AS DateTime), CAST(N'2026-06-22T13:18:20.007' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1004, N'Nhat Kha', N'ductran28122006@gmail.com', N'$2b$12$apexARYaycd1JbZd5OhiJeOLvQqpwTRc0kbaR5tCUalBDCYQpU4GG', N'0989123456', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781958478/rental_rooms/bysd37o8oaf2lishapgs.jpg', NULL, 1, 0, 0, CAST(N'2026-06-20T06:21:08.000' AS DateTime), CAST(N'2026-06-22T08:38:45.953' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1005, N'Nguyen Kha', N'nguyenkhoi190305@gmail.com', N'$2b$12$My1mpv8C0sZfOueBHY1PDu6tp/EIPrgz..ua.0sVUKvYbpZQ1ax2y', N'0989123673', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782118046/rental_rooms/rklc9cwggn8nrohwatdg.jpg', NULL, 1, 0, 0, CAST(N'2026-06-22T08:46:04.037' AS DateTime), CAST(N'2026-06-22T08:47:44.393' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1006, N'Hoàng Nhật Kha', N'nhatkhaiphone@gmail.com', NULL, NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocIaBjpTaKzhPL96g_UVG7z-lFkMeVwCvFclJ8Y0pJaBgy88280=s96-c', N'117315753639178646843', 1, 0, 0, CAST(N'2026-06-28T15:06:55.130' AS DateTime), CAST(N'2026-06-28T15:06:55.130' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1009, N'Linh Hoàng', N'hoanglinhtk2005@gmail.com', NULL, NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocLyeVT4CqDhk0k5CGPMQPT0lZCitD3QBd0_D2pbyDwipRolnw=s96-c', N'109502416066931539447', 1, 0, 0, CAST(N'2026-06-29T03:53:08.623' AS DateTime), CAST(N'2026-06-29T03:53:08.623' AS DateTime), NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at], [ic_number], [ic_issue_date], [ic_issue_place], [permanent_address]) VALUES (1010, N'Nhật Kha', N'nhatkha2005@gmail.com', N'$2b$12$DoukqiIqe.d5DxhFG2ZqXu0gI/4HaQNHbR6MzTPVUSIuXsZNFGDv2', N'0846706745', 2, NULL, NULL, 1, 0, 0, CAST(N'2026-06-29T03:53:46.167' AS DateTime), CAST(N'2026-06-29T03:54:04.223' AS DateTime), NULL, NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[users] OFF
GO
/****** Object:  Index [complaints_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [complaints_landlord_id] ON [dbo].[complaints]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [complaints_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [complaints_room_id] ON [dbo].[complaints]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [complaints_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [complaints_status] ON [dbo].[complaints]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [complaints_tenant_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [complaints_tenant_id] ON [dbo].[complaints]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_complaints_landlord]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_complaints_landlord] ON [dbo].[complaints]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_complaints_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_complaints_room] ON [dbo].[complaints]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_complaints_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_complaints_status] ON [dbo].[complaints]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_complaints_tenant]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_complaints_tenant] ON [dbo].[complaints]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__contract__1CA37CCE04B2E4D4]    Script Date: 6/29/2026 4:37:53 PM ******/
ALTER TABLE [dbo].[contracts] ADD UNIQUE NONCLUSTERED 
(
	[contract_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [contracts_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [contracts_landlord_id] ON [dbo].[contracts]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [contracts_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [contracts_room_id] ON [dbo].[contracts]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [contracts_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [contracts_status] ON [dbo].[contracts]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [contracts_tenant_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [contracts_tenant_id] ON [dbo].[contracts]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_contracts_landlord]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_contracts_landlord] ON [dbo].[contracts]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_contracts_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_contracts_room] ON [dbo].[contracts]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_contracts_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_contracts_status] ON [dbo].[contracts]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_contracts_tenant]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_contracts_tenant] ON [dbo].[contracts]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [conversations_participant_1_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [conversations_participant_1_id] ON [dbo].[conversations]
(
	[participant_1_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [conversations_participant_2_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [conversations_participant_2_id] ON [dbo].[conversations]
(
	[participant_2_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [conversations_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [conversations_room_id] ON [dbo].[conversations]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_conversations_p1]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_conversations_p1] ON [dbo].[conversations]
(
	[participant_1_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_conversations_p2]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_conversations_p2] ON [dbo].[conversations]
(
	[participant_2_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_conversations_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_conversations_room] ON [dbo].[conversations]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_favorites_tenant_room]    Script Date: 6/29/2026 4:37:53 PM ******/
ALTER TABLE [dbo].[favorites] ADD  CONSTRAINT [UQ_favorites_tenant_room] UNIQUE NONCLUSTERED 
(
	[tenant_id] ASC,
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [favorites_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [favorites_room_id] ON [dbo].[favorites]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [favorites_tenant_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [favorites_tenant_id] ON [dbo].[favorites]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [favorites_tenant_id_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [favorites_tenant_id_room_id] ON [dbo].[favorites]
(
	[tenant_id] ASC,
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_favorites_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_favorites_room] ON [dbo].[favorites]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_favorites_tenant]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_favorites_tenant] ON [dbo].[favorites]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_messages_conversation]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_messages_conversation] ON [dbo].[messages]
(
	[conversation_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_messages_sender]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_messages_sender] ON [dbo].[messages]
(
	[sender_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [messages_conversation_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [messages_conversation_id] ON [dbo].[messages]
(
	[conversation_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [messages_sender_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [messages_sender_id] ON [dbo].[messages]
(
	[sender_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_notifications_read]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_notifications_read] ON [dbo].[notifications]
(
	[is_read] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_notifications_user]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_notifications_user] ON [dbo].[notifications]
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [notifications_is_read]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [notifications_is_read] ON [dbo].[notifications]
(
	[is_read] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [notifications_user_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [notifications_user_id] ON [dbo].[notifications]
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_payments_contract]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_payments_contract] ON [dbo].[payments]
(
	[contract_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_payments_landlord]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_payments_landlord] ON [dbo].[payments]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_payments_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_payments_room] ON [dbo].[payments]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_payments_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_payments_status] ON [dbo].[payments]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_payments_tenant]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_payments_tenant] ON [dbo].[payments]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [payments_contract_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [payments_contract_id] ON [dbo].[payments]
(
	[contract_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [payments_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [payments_landlord_id] ON [dbo].[payments]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [payments_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [payments_room_id] ON [dbo].[payments]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [payments_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [payments_status] ON [dbo].[payments]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [payments_tenant_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [payments_tenant_id] ON [dbo].[payments]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [properties_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [properties_landlord_id] ON [dbo].[properties]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [properties_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [properties_status] ON [dbo].[properties]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_rental_requests_landlord]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_rental_requests_landlord] ON [dbo].[rental_requests]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_rental_requests_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_rental_requests_room] ON [dbo].[rental_requests]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_rental_requests_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_rental_requests_status] ON [dbo].[rental_requests]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_rental_requests_tenant]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_rental_requests_tenant] ON [dbo].[rental_requests]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [rental_requests_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [rental_requests_landlord_id] ON [dbo].[rental_requests]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [rental_requests_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [rental_requests_room_id] ON [dbo].[rental_requests]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [rental_requests_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [rental_requests_status] ON [dbo].[rental_requests]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [rental_requests_tenant_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [rental_requests_tenant_id] ON [dbo].[rental_requests]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__roles__783254B1A05080E2]    Script Date: 6/29/2026 4:37:53 PM ******/
ALTER TABLE [dbo].[roles] ADD UNIQUE NONCLUSTERED 
(
	[role_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [roles_role_name]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [roles_role_name] ON [dbo].[roles]
(
	[role_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_Room_Facility]    Script Date: 6/29/2026 4:37:53 PM ******/
ALTER TABLE [dbo].[room_facilities] ADD  CONSTRAINT [UQ_Room_Facility] UNIQUE NONCLUSTERED 
(
	[room_id] ASC,
	[facility_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_room_facilities_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_room_facilities_room] ON [dbo].[room_facilities]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [room_facilities_room_id_facility_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [room_facilities_room_id_facility_id] ON [dbo].[room_facilities]
(
	[room_id] ASC,
	[facility_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_room_images_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_room_images_room] ON [dbo].[room_images]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [room_images_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [room_images_room_id] ON [dbo].[room_images]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_rooms_landlord]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_rooms_landlord] ON [dbo].[rooms]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_rooms_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_rooms_status] ON [dbo].[rooms]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [rooms_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [rooms_landlord_id] ON [dbo].[rooms]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [rooms_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [rooms_status] ON [dbo].[rooms]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__users__AB6E6164A671244B]    Script Date: 6/29/2026 4:37:53 PM ******/
ALTER TABLE [dbo].[users] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_users_email]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_users_email] ON [dbo].[users]
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [users_email]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [users_email] ON [dbo].[users]
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_viewing_schedules_landlord]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_viewing_schedules_landlord] ON [dbo].[viewing_schedules]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_viewing_schedules_room]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_viewing_schedules_room] ON [dbo].[viewing_schedules]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_viewing_schedules_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_viewing_schedules_status] ON [dbo].[viewing_schedules]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_viewing_schedules_tenant]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [idx_viewing_schedules_tenant] ON [dbo].[viewing_schedules]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [viewing_schedules_landlord_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [viewing_schedules_landlord_id] ON [dbo].[viewing_schedules]
(
	[landlord_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [viewing_schedules_room_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [viewing_schedules_room_id] ON [dbo].[viewing_schedules]
(
	[room_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [viewing_schedules_status]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [viewing_schedules_status] ON [dbo].[viewing_schedules]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [viewing_schedules_tenant_id]    Script Date: 6/29/2026 4:37:53 PM ******/
CREATE NONCLUSTERED INDEX [viewing_schedules_tenant_id] ON [dbo].[viewing_schedules]
(
	[tenant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[bookings] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[bookings] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[bookings] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[complaints] ADD  DEFAULT ('other') FOR [complaint_type]
GO
ALTER TABLE [dbo].[complaints] ADD  DEFAULT ('open') FOR [status]
GO
ALTER TABLE [dbo].[complaints] ADD  DEFAULT ('medium') FOR [priority]
GO
ALTER TABLE [dbo].[complaints] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[complaints] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[contracts] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[contracts] ADD  DEFAULT ((0)) FOR [tenant_agreed]
GO
ALTER TABLE [dbo].[contracts] ADD  DEFAULT ((0)) FOR [is_renewed]
GO
ALTER TABLE [dbo].[contracts] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[contracts] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[conversations] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[conversations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[conversations] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[facilities] ADD  DEFAULT ('room') FOR [category]
GO
ALTER TABLE [dbo].[facilities] ADD  DEFAULT ('other') FOR [facility_type]
GO
ALTER TABLE [dbo].[facilities] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[favorites] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[messages] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[messages] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ('system') FOR [notification_type]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[otp_verifications] ADD  DEFAULT ((0)) FOR [is_used]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ('rent') FOR [payment_type]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ((0)) FOR [platform_fee]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ((0)) FOR [refund_amount]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ((0)) FOR [net_amount]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ('pending') FOR [payout_status]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[properties] ADD  DEFAULT ((1)) FOR [total_floors]
GO
ALTER TABLE [dbo].[properties] ADD  DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[properties] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[properties] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[properties] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[rental_requests] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[rental_requests] ADD  DEFAULT ((12)) FOR [lease_duration_months]
GO
ALTER TABLE [dbo].[rental_requests] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[rental_requests] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[room_facilities] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[room_images] ADD  DEFAULT ((0)) FOR [is_primary]
GO
ALTER TABLE [dbo].[room_images] ADD  DEFAULT ((0)) FOR [display_order]
GO
ALTER TABLE [dbo].[room_images] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT ('single') FOR [room_type]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT ((1)) FOR [bedrooms]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT ((1)) FOR [max_occupants]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT ('available') FOR [status]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[rooms] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((0)) FOR [is_banned]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[viewing_schedules] ADD  DEFAULT ('pending_payment') FOR [status]
GO
ALTER TABLE [dbo].[viewing_schedules] ADD  DEFAULT ('pending') FOR [tenant_decision]
GO
ALTER TABLE [dbo].[viewing_schedules] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[viewing_schedules] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[bookings]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[bookings]  WITH CHECK ADD FOREIGN KEY([listing_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[bookings]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[complaints]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[complaints]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[complaints]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[contracts]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[contracts]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[contracts]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[conversations]  WITH CHECK ADD FOREIGN KEY([participant_1_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[conversations]  WITH CHECK ADD FOREIGN KEY([participant_2_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[conversations]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[favorites]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[favorites]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[messages]  WITH CHECK ADD FOREIGN KEY([conversation_id])
REFERENCES [dbo].[conversations] ([conversation_id])
GO
ALTER TABLE [dbo].[messages]  WITH CHECK ADD FOREIGN KEY([sender_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[otp_verifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([contract_id])
REFERENCES [dbo].[contracts] ([contract_id])
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[properties]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[rental_requests]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[rental_requests]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[rental_requests]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[room_facilities]  WITH CHECK ADD FOREIGN KEY([facility_id])
REFERENCES [dbo].[facilities] ([facility_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[room_facilities]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[room_images]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[rooms]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[rooms]  WITH CHECK ADD FOREIGN KEY([property_id])
REFERENCES [dbo].[properties] ([property_id])
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[roles] ([role_id])
GO
ALTER TABLE [dbo].[viewing_schedules]  WITH CHECK ADD FOREIGN KEY([landlord_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[viewing_schedules]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[rooms] ([room_id])
GO
ALTER TABLE [dbo].[viewing_schedules]  WITH CHECK ADD FOREIGN KEY([tenant_id])
REFERENCES [dbo].[users] ([user_id])
GO
USE [master]
GO
ALTER DATABASE [RentalRoomSystem] SET  READ_WRITE 
GO

-- =========================================================
-- DATA EXPORT
-- =========================================================

SET IDENTITY_INSERT roles ON;
GO
INSERT INTO roles (role_id, role_name, description) VALUES
(1, N'Admin', N'System Administrator with full access'),
(2, N'Landlord', N'Property Owner who manages boarding houses & listings'),
(3, N'Tenant', N'Renters who search rooms, sign contracts, and send requests');
SET IDENTITY_INSERT roles OFF;
GO

SET IDENTITY_INSERT users ON;
GO
INSERT INTO users (user_id, full_name, email, password_hash, phone, role_id, avatar_url, ic_number, ic_issue_date, ic_issue_place, permanent_address, google_id, is_active, is_banned, is_deleted, created_at, updated_at) VALUES
(1, N'Đức Trần', N'ductran281206@gmail.com', N'$2b$12$.ZGsNZB7D3TUrj0HlUzz9ewAVDP2IfPsmxUtvoU45Whzu36f4qiFC', NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocLEh19aZ_gZpyAvEEaezF40fpkJ5USMN8HU5oeEswc0Ed5vcXGM=s96-c', NULL, NULL, NULL, NULL, N'107547421603725758963', 1, 0, 0, '2026-06-12 02:25:34', '2026-06-21 21:14:38'),
(2, N'Duc', N'williamlata01@gmail.com', N'$2b$12$1NZ.anBIqI4QVFP9M6ot3O7zfCy7fR0LBMMjcxQ5NHDgWB9rRUzN2', N'0968902029', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117675/rental_rooms/ypzdgtlz7zj8pm9wftkm.jpg', N'123456789012', N'2024-06-27', N'Cục Cảnh Sát Trật Tự và Xã Hội', N'58 Nguyễn Hữu Thọ,Hải Châu,Đà Nẵng', NULL, 1, 0, 0, '2026-06-12 02:26:49', '2026-06-29 10:45:32'),
(1002, N'System Administrator', N'admin@smartroom.com', N'$2b$12$qnO3.m20cjJDkqY5uVUlneDfhtX1PuuKEQ8e1ZY1V4SMpsTF7hcEa', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2026-06-13 06:22:55', '2026-06-13 06:22:55'),
(1003, N'Hai', N'ductran28122k6@gmail.com', N'$2b$12$7C1V2UOpw30flZsRKDA5c.7U8h2AgW7TwssT9XOBpgTdHDVYi0K0S', N'0925134567', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109099/rental_rooms/xg0ysluci3ijemuxuoi5.png', NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2026-06-13 07:39:46', '2026-06-22 13:18:20'),
(1004, N'Nhat Kha', N'ductran28122006@gmail.com', N'$2b$12$apexARYaycd1JbZd5OhiJeOLvQqpwTRc0kbaR5tCUalBDCYQpU4GG', N'0989123456', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781958478/rental_rooms/bysd37o8oaf2lishapgs.jpg', NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2026-06-20 06:21:08', '2026-06-22 08:38:45'),
(1005, N'Nguyen Kha', N'nguyenkhoi190305@gmail.com', N'$2b$12$My1mpv8C0sZfOueBHY1PDu6tp/EIPrgz..ua.0sVUKvYbpZQ1ax2y', N'0989123673', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782118046/rental_rooms/rklc9cwggn8nrohwatdg.jpg', NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2026-06-22 08:46:04', '2026-06-22 08:47:44'),
(1006, N'Hoàng Nhật Kha', N'nhatkhaiphone@gmail.com', NULL, NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocIaBjpTaKzhPL96g_UVG7z-lFkMeVwCvFclJ8Y0pJaBgy88280=s96-c', NULL, NULL, NULL, NULL, N'117315753639178646843', 1, 0, 0, '2026-06-28 15:06:55', '2026-06-28 15:06:55'),
(1009, N'Linh Hoàng', N'hoanglinhtk2005@gmail.com', NULL, NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocLyeVT4CqDhk0k5CGPMQPT0lZCitD3QBd0_D2pbyDwipRolnw=s96-c', NULL, NULL, NULL, NULL, N'109502416066931539447', 1, 0, 0, '2026-06-29 03:53:08', '2026-06-29 03:53:08'),
(1010, N'Nhật Kha', N'nhatkha2005@gmail.com', N'$2b$12$DoukqiIqe.d5DxhFG2ZqXu0gI/4HaQNHbR6MzTPVUSIuXsZNFGDv2', N'0846706745', 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2026-06-29 03:53:46', '2026-06-29 03:54:04');
SET IDENTITY_INSERT users OFF;
GO

SET IDENTITY_INSERT facilities ON;
GO
INSERT INTO facilities (facility_id, facility_name, category, facility_type, created_at) VALUES
(1, N'WiFi', N'room', N'utility', '2026-06-28 21:56:28'),
(2, N'Air Conditioner', N'room', N'appliance', '2026-06-28 21:56:28'),
(3, N'Parking', N'room', N'utility', '2026-06-28 21:56:28'),
(4, N'Private Bathroom', N'room', N'utility', '2026-06-28 21:56:28'),
(5, N'Balcony', N'room', N'utility', '2026-06-28 21:56:28'),
(6, N'Bed', N'room', N'furniture', '2026-06-28 21:56:28'),
(7, N'Wardrobe', N'room', N'furniture', '2026-06-28 21:56:28'),
(8, N'Kitchen', N'room', N'utility', '2026-06-28 21:56:28'),
(9, N'Security Camera', N'room', N'security', '2026-06-28 21:56:28'),
(10, N'Near University', N'nearby', N'education', '2026-06-28 21:56:28'),
(11, N'Near Hospital', N'nearby', N'hospital', '2026-06-28 21:56:28'),
(12, N'Near Supermarket', N'nearby', N'shopping', '2026-06-28 21:56:28'),
(13, N'Near Bus Station', N'nearby', N'transport', '2026-06-28 21:56:28'),
(14, N'Near Market', N'nearby', N'shopping', '2026-06-28 21:56:28'),
(15, N'Near Park', N'nearby', N'recreation', '2026-06-28 21:56:28'),
(16, N'Near Convenience Store', N'nearby', N'shopping', '2026-06-28 21:56:28');
SET IDENTITY_INSERT facilities OFF;
GO

SET IDENTITY_INSERT rooms ON;
GO
INSERT INTO rooms (room_id, landlord_id, property_id, floor, room_number, title, description, address, city, district, ward, price_per_month, area_sqm, room_type, bedrooms, max_occupants, status, thumbnail_url, rejection_reason, is_deleted, created_at, updated_at) VALUES
(1, 2, 1, 1, NULL, N'Test Room', NULL, N'123 Test', N'Test City', NULL, NULL, 3000000, NULL, N'private_room', 1, 4, N'pending', NULL, NULL, 1, '2026-06-28 15:45:29', '2026-06-28 15:54:04'),
(2, 2, 3, 1, NULL, N'Test Room 2', N'This is a test room in the test building.', N'456 Test St', N'Tỉnh An Giang', N'Huyện Phú Tân', NULL, 3000000, 0, N'private_room', 1, 4, N'pending', NULL, NULL, 1, '2026-06-28 15:51:44', '2026-06-28 15:52:38'),
(66, 2, 1, 1, N'101', N'Phòng 25m2', N'tối đa 2 người ở', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, 2000000, 25, N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', NULL, 0, '2026-06-28 16:05:10', '2026-06-28 16:52:14'),
(67, 2, 1, 1, N'102', N'1dug', N'dgdg', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 2000000, 25, N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', NULL, 1, '2026-06-28 16:25:37', '2026-06-28 16:26:45'),
(68, 2, 4, 1, N'101', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, 4000000, 30, N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 0, '2026-06-29 02:25:33', '2026-06-29 02:25:33'),
(69, 2, 4, 1, N'102', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, 4000000, 30, N'private_room', 1, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, '2026-06-29 02:37:19', '2026-06-29 02:37:19'),
(70, 2, 4, 5, N'501', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 4000000, 30, N'private_room', 1, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, '2026-06-29 02:38:08', '2026-06-29 02:38:08'),
(71, 2, 1, 2, N'201', N'Phòng 25m2', N'tối đa 2 người ở', N'Lê Thiện Trị', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 2000000, 25, N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', NULL, 0, '2026-06-29 02:41:10', '2026-06-29 02:41:10'),
(72, 2, 4, 2, N'203.206', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 4000000, 30, N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 1, '2026-06-29 02:47:49', '2026-06-29 02:48:04'),
(73, 2, 4, 2, N'203', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 4000000, 30, N'private_room', 1, 2, N'pending', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 0, '2026-06-29 02:48:18', '2026-06-29 02:48:18'),
(74, 2, 4, 2, N'206', N'fsgs', N'sdgsdgsdg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 4000000, 30, N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', NULL, 0, '2026-06-29 02:48:18', '2026-06-29 02:48:18'),
(75, 2, 4, 4, N'401', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 4000000, 30, N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, '2026-06-29 02:48:35', '2026-06-29 02:48:35'),
(76, 2, 4, 4, N'402', N'tfvghfg', N'sgdfg', N'32 Nguyễn Văn Linh', N'Thành phố Đà Nẵng', N'Quận Hải Châu', N'', 4000000, 30, N'private_room', 1, 2, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', NULL, 0, '2026-06-29 02:48:35', '2026-06-29 02:48:35'),
(77, 1010, NULL, NULL, N'Nguyên Can', N'gdgd', N'dfgdg', N'56 doãn uẩn', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, 5000000, 40, N'private_room', 1, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782705441/rental_rooms/f1o8438tcwukkqhhyyoo.png', NULL, 0, '2026-06-29 03:57:21', '2026-06-29 03:57:21');
SET IDENTITY_INSERT rooms OFF;
GO

SET IDENTITY_INSERT room_images ON;
GO
INSERT INTO room_images (image_id, room_id, image_url, is_primary, display_order, created_at) VALUES
(2, 66, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782662708/rental_rooms/y9gfeiol4z4lhjsxxqxf.png', 1, 0, '2026-06-28 16:05:10'),
(3, 68, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782699932/rental_rooms/meqwuvmeetq4njyaef3v.png', 1, 0, '2026-06-29 02:25:33'),
(4, 69, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782700638/rental_rooms/u7rhzayikrpbiiyjojr4.png', 1, 0, '2026-06-29 02:37:19'),
(5, 77, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782705441/rental_rooms/f1o8438tcwukkqhhyyoo.png', 1, 0, '2026-06-29 03:57:22');
SET IDENTITY_INSERT room_images OFF;
GO

SET IDENTITY_INSERT room_facilities ON;
GO
INSERT INTO room_facilities (id, room_id, facility_id, created_at) VALUES
(1, 2, 1, '2026-06-28 15:51:44'),
(2, 2, 2, '2026-06-28 15:51:45'),
(3, 2, 3, '2026-06-28 15:51:45'),
(1012, 66, 1, '2026-06-28 16:05:10'),
(1013, 66, 2, '2026-06-28 16:05:10'),
(1014, 66, 3, '2026-06-28 16:05:10'),
(1015, 66, 4, '2026-06-28 16:05:10'),
(1016, 66, 5, '2026-06-28 16:05:10'),
(1017, 66, 6, '2026-06-28 16:05:10'),
(1018, 66, 7, '2026-06-28 16:05:10'),
(1019, 66, 8, '2026-06-28 16:05:10'),
(1020, 66, 9, '2026-06-28 16:05:10'),
(1021, 66, 10, '2026-06-28 16:05:10'),
(1022, 66, 11, '2026-06-28 16:05:10'),
(1023, 66, 12, '2026-06-28 16:05:10'),
(1024, 66, 13, '2026-06-28 16:05:10'),
(1025, 66, 14, '2026-06-28 16:05:10'),
(1026, 66, 15, '2026-06-28 16:05:10'),
(1027, 66, 16, '2026-06-28 16:05:10'),
(1028, 67, 1, '2026-06-28 16:25:37'),
(1029, 67, 2, '2026-06-28 16:25:37'),
(1030, 67, 3, '2026-06-28 16:25:37'),
(1031, 67, 4, '2026-06-28 16:25:37'),
(1032, 67, 5, '2026-06-28 16:25:37'),
(1033, 67, 6, '2026-06-28 16:25:37'),
(1034, 67, 7, '2026-06-28 16:25:37'),
(1035, 67, 8, '2026-06-28 16:25:37'),
(1036, 67, 9, '2026-06-28 16:25:37'),
(1037, 67, 10, '2026-06-28 16:25:37'),
(1038, 67, 11, '2026-06-28 16:25:37'),
(1039, 67, 12, '2026-06-28 16:25:37'),
(1040, 67, 13, '2026-06-28 16:25:37'),
(1041, 67, 14, '2026-06-28 16:25:37'),
(1042, 67, 15, '2026-06-28 16:25:37'),
(1043, 67, 16, '2026-06-28 16:25:37'),
(1044, 68, 1, '2026-06-29 02:25:33'),
(1045, 68, 2, '2026-06-29 02:25:33'),
(1046, 68, 3, '2026-06-29 02:25:34'),
(1047, 68, 4, '2026-06-29 02:25:34'),
(1048, 68, 5, '2026-06-29 02:25:34'),
(1049, 68, 6, '2026-06-29 02:25:34'),
(1050, 68, 7, '2026-06-29 02:25:34'),
(1051, 68, 8, '2026-06-29 02:25:34'),
(1052, 68, 9, '2026-06-29 02:25:34'),
(1053, 68, 10, '2026-06-29 02:25:34'),
(1054, 68, 11, '2026-06-29 02:25:34'),
(1055, 68, 12, '2026-06-29 02:25:34'),
(1056, 68, 13, '2026-06-29 02:25:34'),
(1057, 68, 14, '2026-06-29 02:25:34'),
(1058, 68, 15, '2026-06-29 02:25:34'),
(1059, 68, 16, '2026-06-29 02:25:34'),
(1060, 69, 1, '2026-06-29 02:37:19'),
(1061, 69, 2, '2026-06-29 02:37:19'),
(1062, 69, 3, '2026-06-29 02:37:19'),
(1063, 69, 4, '2026-06-29 02:37:19'),
(1064, 69, 5, '2026-06-29 02:37:19'),
(1065, 69, 6, '2026-06-29 02:37:19'),
(1066, 69, 7, '2026-06-29 02:37:19'),
(1067, 69, 8, '2026-06-29 02:37:20'),
(1068, 69, 9, '2026-06-29 02:37:20'),
(1069, 69, 10, '2026-06-29 02:37:20'),
(1070, 69, 11, '2026-06-29 02:37:20'),
(1071, 69, 12, '2026-06-29 02:37:20'),
(1072, 69, 13, '2026-06-29 02:37:20'),
(1073, 69, 14, '2026-06-29 02:37:20'),
(1074, 69, 15, '2026-06-29 02:37:20'),
(1075, 69, 16, '2026-06-29 02:37:20'),
(1076, 70, 1, '2026-06-29 02:38:08'),
(1077, 70, 2, '2026-06-29 02:38:08'),
(1078, 70, 3, '2026-06-29 02:38:08'),
(1079, 70, 4, '2026-06-29 02:38:08'),
(1080, 70, 5, '2026-06-29 02:38:08'),
(1081, 70, 6, '2026-06-29 02:38:08'),
(1082, 70, 7, '2026-06-29 02:38:08'),
(1083, 70, 8, '2026-06-29 02:38:08'),
(1084, 70, 9, '2026-06-29 02:38:08'),
(1085, 70, 10, '2026-06-29 02:38:08'),
(1086, 70, 11, '2026-06-29 02:38:08'),
(1087, 70, 12, '2026-06-29 02:38:08'),
(1088, 70, 13, '2026-06-29 02:38:08'),
(1089, 70, 14, '2026-06-29 02:38:08'),
(1090, 70, 15, '2026-06-29 02:38:08'),
(1091, 70, 16, '2026-06-29 02:38:08'),
(1092, 71, 1, '2026-06-29 02:41:10'),
(1093, 71, 2, '2026-06-29 02:41:10'),
(1094, 71, 3, '2026-06-29 02:41:10'),
(1095, 71, 4, '2026-06-29 02:41:10'),
(1096, 71, 5, '2026-06-29 02:41:10'),
(1097, 71, 6, '2026-06-29 02:41:10'),
(1098, 71, 7, '2026-06-29 02:41:10'),
(1099, 71, 8, '2026-06-29 02:41:10'),
(1100, 71, 9, '2026-06-29 02:41:10'),
(1101, 71, 10, '2026-06-29 02:41:10'),
(1102, 71, 11, '2026-06-29 02:41:10'),
(1103, 71, 12, '2026-06-29 02:41:10'),
(1104, 71, 13, '2026-06-29 02:41:10'),
(1105, 71, 14, '2026-06-29 02:41:10'),
(1106, 71, 15, '2026-06-29 02:41:10'),
(1107, 71, 16, '2026-06-29 02:41:10'),
(1108, 72, 1, '2026-06-29 02:47:49');
INSERT INTO room_facilities (id, room_id, facility_id, created_at) VALUES
(1109, 72, 2, '2026-06-29 02:47:49'),
(1110, 72, 3, '2026-06-29 02:47:49'),
(1111, 72, 4, '2026-06-29 02:47:49'),
(1112, 72, 5, '2026-06-29 02:47:49'),
(1113, 72, 6, '2026-06-29 02:47:49'),
(1114, 72, 7, '2026-06-29 02:47:49'),
(1115, 72, 8, '2026-06-29 02:47:49'),
(1116, 72, 9, '2026-06-29 02:47:49'),
(1117, 72, 10, '2026-06-29 02:47:49'),
(1118, 72, 11, '2026-06-29 02:47:49'),
(1119, 72, 12, '2026-06-29 02:47:49'),
(1120, 72, 13, '2026-06-29 02:47:49'),
(1121, 72, 14, '2026-06-29 02:47:49'),
(1122, 72, 15, '2026-06-29 02:47:49'),
(1123, 72, 16, '2026-06-29 02:47:49'),
(1124, 73, 1, '2026-06-29 02:48:18'),
(1125, 73, 2, '2026-06-29 02:48:18'),
(1126, 73, 3, '2026-06-29 02:48:18'),
(1127, 73, 4, '2026-06-29 02:48:18'),
(1128, 73, 5, '2026-06-29 02:48:18'),
(1129, 73, 6, '2026-06-29 02:48:18'),
(1130, 73, 7, '2026-06-29 02:48:18'),
(1131, 73, 8, '2026-06-29 02:48:18'),
(1132, 73, 9, '2026-06-29 02:48:18'),
(1133, 73, 10, '2026-06-29 02:48:18'),
(1134, 73, 11, '2026-06-29 02:48:18'),
(1135, 73, 12, '2026-06-29 02:48:18'),
(1136, 73, 13, '2026-06-29 02:48:18'),
(1137, 73, 14, '2026-06-29 02:48:18'),
(1138, 73, 15, '2026-06-29 02:48:18'),
(1139, 73, 16, '2026-06-29 02:48:18'),
(1140, 74, 1, '2026-06-29 02:48:18'),
(1141, 74, 2, '2026-06-29 02:48:18'),
(1142, 74, 3, '2026-06-29 02:48:18'),
(1143, 74, 4, '2026-06-29 02:48:18'),
(1144, 74, 5, '2026-06-29 02:48:18'),
(1145, 74, 6, '2026-06-29 02:48:18'),
(1146, 74, 7, '2026-06-29 02:48:18'),
(1147, 74, 8, '2026-06-29 02:48:18'),
(1148, 74, 9, '2026-06-29 02:48:18'),
(1149, 74, 10, '2026-06-29 02:48:18'),
(1150, 74, 11, '2026-06-29 02:48:18'),
(1151, 74, 12, '2026-06-29 02:48:18'),
(1152, 74, 13, '2026-06-29 02:48:18'),
(1153, 74, 14, '2026-06-29 02:48:18'),
(1154, 74, 15, '2026-06-29 02:48:18'),
(1155, 74, 16, '2026-06-29 02:48:18'),
(1156, 75, 1, '2026-06-29 02:48:35'),
(1157, 75, 2, '2026-06-29 02:48:35'),
(1158, 75, 3, '2026-06-29 02:48:35'),
(1159, 75, 4, '2026-06-29 02:48:35'),
(1160, 75, 5, '2026-06-29 02:48:35'),
(1161, 75, 6, '2026-06-29 02:48:35'),
(1162, 75, 7, '2026-06-29 02:48:35'),
(1163, 75, 8, '2026-06-29 02:48:35'),
(1164, 75, 9, '2026-06-29 02:48:35'),
(1165, 75, 10, '2026-06-29 02:48:35'),
(1166, 75, 11, '2026-06-29 02:48:35'),
(1167, 75, 12, '2026-06-29 02:48:35'),
(1168, 75, 13, '2026-06-29 02:48:35'),
(1169, 75, 14, '2026-06-29 02:48:35'),
(1170, 75, 15, '2026-06-29 02:48:35'),
(1171, 75, 16, '2026-06-29 02:48:35'),
(1172, 76, 1, '2026-06-29 02:48:35'),
(1173, 76, 2, '2026-06-29 02:48:35'),
(1174, 76, 3, '2026-06-29 02:48:35'),
(1175, 76, 4, '2026-06-29 02:48:35'),
(1176, 76, 5, '2026-06-29 02:48:35'),
(1177, 76, 6, '2026-06-29 02:48:35'),
(1178, 76, 7, '2026-06-29 02:48:35'),
(1179, 76, 8, '2026-06-29 02:48:35'),
(1180, 76, 9, '2026-06-29 02:48:35'),
(1181, 76, 10, '2026-06-29 02:48:35'),
(1182, 76, 11, '2026-06-29 02:48:35'),
(1183, 76, 12, '2026-06-29 02:48:35'),
(1184, 76, 13, '2026-06-29 02:48:35'),
(1185, 76, 14, '2026-06-29 02:48:35'),
(1186, 76, 15, '2026-06-29 02:48:35'),
(1187, 76, 16, '2026-06-29 02:48:35'),
(1188, 77, 1, '2026-06-29 03:57:22'),
(1189, 77, 2, '2026-06-29 03:57:22'),
(1190, 77, 4, '2026-06-29 03:57:22'),
(1191, 77, 5, '2026-06-29 03:57:22'),
(1192, 77, 6, '2026-06-29 03:57:22'),
(1193, 77, 7, '2026-06-29 03:57:22'),
(1194, 77, 8, '2026-06-29 03:57:22'),
(1195, 77, 9, '2026-06-29 03:57:22'),
(1196, 77, 10, '2026-06-29 03:57:22'),
(1197, 77, 11, '2026-06-29 03:57:22'),
(1198, 77, 12, '2026-06-29 03:57:22'),
(1199, 77, 13, '2026-06-29 03:57:22'),
(1200, 77, 14, '2026-06-29 03:57:22'),
(1201, 77, 15, '2026-06-29 03:57:22'),
(1202, 77, 16, '2026-06-29 03:57:22');
SET IDENTITY_INSERT room_facilities OFF;
GO

SET IDENTITY_INSERT rental_requests ON;
GO
INSERT INTO rental_requests (request_id, room_id, tenant_id, landlord_id, status, requested_move_in_date, lease_duration_months, message, rejection_reason, created_at, updated_at) VALUES
(1, 66, 1006, 2, N'completed', '2026-06-28 00:00:00', 3, NULL, NULL, '2026-06-28 16:05:38', '2026-06-28 16:28:45'),
(2, 66, 1006, 2, N'approved', NULL, NULL, NULL, NULL, '2026-06-28 16:26:29', '2026-06-28 09:27:02'),
(3, 74, 1006, 2, N'completed', '2026-06-29 00:00:00', 6, NULL, NULL, '2026-06-29 03:14:10', '2026-06-29 03:26:12'),
(4, 75, 1006, 2, N'completed', '2026-06-29 00:00:00', 6, NULL, NULL, '2026-06-29 03:46:10', '2026-06-29 03:49:58'),
(6, 76, 1006, 2, N'rejected', NULL, NULL, NULL, N'hongr', '2026-06-29 08:00:07', '2026-06-29 01:00:46'),
(7, 76, 1006, 2, N'completed', '2026-06-30 00:00:00', 6, NULL, NULL, '2026-06-29 08:01:27', '2026-06-29 08:05:50'),
(8, 77, 1006, 1010, N'contract_requested', '2026-06-30 00:00:00', 6, NULL, NULL, '2026-06-29 08:11:08', '2026-06-29 01:19:45');
SET IDENTITY_INSERT rental_requests OFF;
GO

SET IDENTITY_INSERT contracts ON;
GO
INSERT INTO contracts (contract_id, room_id, tenant_id, landlord_id, contract_number, start_date, end_date, monthly_rent, deposit_amount, status, tenant_agreed, terms_and_conditions, document_url, is_renewed, landlord_name, landlord_ic, landlord_ic_issue_date, landlord_ic_issue_place, landlord_permanent_address, landlord_signature, tenant_name, tenant_ic, tenant_ic_issue_date, tenant_ic_issue_place, tenant_permanent_address, tenant_signature, renewal_contract_id, created_at, updated_at) VALUES
(2, 66, 1006, 2, N'CT-753428-736', '2026-06-28 00:00:00', '2026-09-28 00:00:00', 2000000, 2000000, N'active', 1, N'fsfs', NULL, 0, N'Nhật kha', N'049205005039', N'2026-06-28', N'cục cảnh sát', N'39 Lê Thiện Trị', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782664111/signatures/zwscaapdbu0g01l18out.png', N'Hoàng Nhật Kha', N'049205005039', N'2024-01-16', N'Cục Cảnh sát xã hội', N'56 Doãn uẩn ngũ hành sơn đà nẵng', N'data:image/png;base64,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', NULL, '2026-06-28 16:22:33', '2026-06-28 16:28:45'),
(3, 74, 1006, 2, N'CT-015868-580', '2026-06-29 00:00:00', '2026-12-29 00:00:00', 4000000, 4000000, N'active', 1, N'', NULL, 0, N'Đức', N'123456789012', N'2024-06-26', N'Cục Cảnh Sát', N'32 Nguyễn Văn Linh ', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782703562/signatures/gzin1tdvbt3pdpjeaxqy.png', N'Phương Dung', N'123456789034', N'2025-02-18', N'cục cảnh sát', N'324 Nguyễn Hữu Thọ Đà Nẵng', N'data:image/png;base64,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', NULL, '2026-06-29 03:16:55', '2026-06-29 03:26:12'),
(4, 75, 1006, 2, N'CT-836488-566', '2026-06-29 00:00:00', '2026-12-29 00:00:00', 4000000, 4000000, N'active', 1, N'', NULL, 0, N'Duc', N'123456789012', N'2024-06-27', N'Cục Cảnh Sát Trật Tự và Xã Hội', N'58 Nguyễn Hữu Thọ,Hải Châu,Đà Nẵng', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782704989/signatures/kkt8jpzsd8lstshz34h0.png', N'Hoàng Long', N'123243546572', N'2022-05-29', N'Cục Cảnh Sát', N'123 lê thiện trị', N'data:image/png;base64,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', NULL, '2026-06-29 03:47:16', '2026-06-29 03:49:58'),
(6, 76, 1006, 2, N'CT-164258-312', '2026-06-30 00:00:00', '2026-12-30 00:00:00', 4000000, 4000000, N'active', 1, N'', NULL, 0, N'Duc', N'123456789012', N'2024-06-27', N'Cục Cảnh Sát Trật Tự và Xã Hội', N'58 Nguyễn Hữu Thọ,Hải Châu,Đà Nẵng', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782720223/signatures/to6x6uomoozthy5xgchv.png', N'Dung', N'234567890123', N'2023-01-10', N'cucj ', N'asdfgh', N'data:image/png;base64,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', NULL, '2026-06-29 08:02:44', '2026-06-29 08:05:50'),
(7, 77, 1006, 1010, N'CT-185122-024', '2026-06-30 00:00:00', '2026-12-30 00:00:00', 5000000, 5000000, N'draft', 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, N'Phương Dung', N'123456789023', N'2024-01-23', N'Cục', N'123 sdgfg', NULL, NULL, '2026-06-29 08:19:45', '2026-06-29 08:19:45');
SET IDENTITY_INSERT contracts OFF;
GO

SET IDENTITY_INSERT payments ON;
GO
INSERT INTO payments (payment_id, contract_id, tenant_id, landlord_id, room_id, viewing_schedule_id, amount, payment_type, status, payment_method, transaction_id, due_date, paid_date, notes, platform_fee, refund_amount, net_amount, payout_status, payout_date, created_at, updated_at) VALUES
(1, 2, 1006, 2, 66, NULL, 4000000, N'deposit', N'completed', N'vnpay', N'15602243', NULL, '2026-06-28 16:34:41', NULL, 200000, 0, 3800000, N'completed', '2026-06-28 16:35:44', '2026-06-28 16:32:55', '2026-06-28 16:34:41'),
(2, 3, 1006, 2, 74, NULL, 8000000, N'deposit', N'completed', N'vnpay', N'15602583', NULL, '2026-06-29 03:28:12', NULL, 400000, 0, 7600000, N'completed', '2026-06-29 03:28:52', '2026-06-29 03:26:15', '2026-06-29 03:28:12'),
(3, 4, 1006, 2, 75, NULL, 8000000, N'deposit', N'completed', N'vnpay', N'15602655', NULL, '2026-06-29 03:50:36', NULL, 400000, 0, 7600000, N'completed', '2026-06-29 03:51:43', '2026-06-29 03:50:00', '2026-06-29 03:50:36'),
(4, 6, 1006, 2, 76, NULL, 8000000, N'deposit', N'completed', N'vnpay', N'15603145', NULL, '2026-06-29 08:06:47', NULL, 400000, 0, 7600000, N'completed', '2026-06-29 08:07:12', '2026-06-29 08:05:56', '2026-06-29 08:06:47');
SET IDENTITY_INSERT payments OFF;
GO

SET IDENTITY_INSERT notifications ON;
GO
INSERT INTO notifications (notification_id, user_id, title, message, notification_type, related_id, is_read, read_at, created_at) VALUES
(1, 2, N'Listing Approved', N'Good news! Your listing "dfgd" has been approved and is now live.', N'system', 3, 0, NULL, '2026-06-28 15:55:30'),
(2, 2, N'Listing Approved', N'Good news! Your listing "1dug" has been approved and is now live.', N'system', 66, 0, NULL, '2026-06-28 16:05:18'),
(3, 2, N'New Rental Request', N'You have a new rental request for 1dug.', N'rental_request', 1, 0, NULL, '2026-06-28 16:05:38'),
(4, 1006, N'Rental Request Approved', N'Your rental request for 1dug has been approved!', N'rental_request', 1, 0, NULL, '2026-06-28 16:05:55'),
(5, 2, N'Contract Requested', N'Tenant has requested a contract for "1dug".', N'contract', 2, 0, NULL, '2026-06-28 16:22:33'),
(6, 2, N'New Rental Request', N'You have a new rental request for 1dug.', N'rental_request', 2, 0, NULL, '2026-06-28 16:26:29'),
(7, 1006, N'Rental Request Approved', N'Your rental request for 1dug has been approved!', N'rental_request', 2, 0, NULL, '2026-06-28 16:27:02'),
(8, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for 1dug. Please review, sign, and pay the deposit.', N'contract', 2, 0, NULL, '2026-06-28 16:28:33'),
(9, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "1dug". Waiting for deposit payment.', N'contract', 2, 0, NULL, '2026-06-28 16:28:45'),
(10, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "1dug". The rental is now active.', N'contract', 2, 0, NULL, '2026-06-28 16:34:41'),
(11, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "1dug". The rental is now active.', N'contract', 2, 0, NULL, '2026-06-28 16:34:41'),
(12, 2, N'Listing Approved', N'Good news! Your listing "tfvghfg" has been approved and is now live.', N'system', 76, 0, NULL, '2026-06-29 03:13:21'),
(13, 2, N'Listing Approved', N'Good news! Your listing "tfvghfg" has been approved and is now live.', N'system', 75, 0, NULL, '2026-06-29 03:13:25'),
(14, 2, N'Listing Approved', N'Good news! Your listing "fsgs" has been approved and is now live.', N'system', 74, 0, NULL, '2026-06-29 03:13:28'),
(15, 2, N'New Rental Request', N'You have a new rental request for fsgs.', N'rental_request', 3, 0, NULL, '2026-06-29 03:14:10'),
(16, 1006, N'Rental Request Approved', N'Your rental request for fsgs has been approved!', N'rental_request', 3, 0, NULL, '2026-06-29 03:14:26'),
(17, 2, N'Contract Requested', N'Tenant has requested a contract for "fsgs".', N'contract', 3, 0, NULL, '2026-06-29 03:16:55'),
(18, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for fsgs. Please review, sign, and pay the deposit.', N'contract', 3, 0, NULL, '2026-06-29 03:26:03'),
(19, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "fsgs". Waiting for deposit payment.', N'contract', 3, 0, NULL, '2026-06-29 03:26:12'),
(20, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "fsgs". The rental is now active.', N'contract', 3, 0, NULL, '2026-06-29 03:28:12'),
(21, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "fsgs". The rental is now active.', N'contract', 3, 0, NULL, '2026-06-29 03:28:12'),
(22, 2, N'New Rental Request', N'You have a new rental request for tfvghfg.', N'rental_request', 4, 0, NULL, '2026-06-29 03:46:10'),
(23, 1006, N'Rental Request Approved', N'Your rental request for tfvghfg has been approved!', N'rental_request', 4, 0, NULL, '2026-06-29 03:46:16'),
(24, 2, N'Contract Requested', N'Tenant has requested a contract for "tfvghfg".', N'contract', 4, 0, NULL, '2026-06-29 03:47:16'),
(25, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for tfvghfg. Please review, sign, and pay the deposit.', N'contract', 4, 0, NULL, '2026-06-29 03:49:49'),
(26, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "tfvghfg". Waiting for deposit payment.', N'contract', 4, 0, NULL, '2026-06-29 03:49:58'),
(27, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 4, 0, NULL, '2026-06-29 03:50:36'),
(28, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 4, 0, NULL, '2026-06-29 03:50:36'),
(29, 1010, N'Listing Approved', N'Good news! Your listing "gdgd" has been approved and is now live.', N'system', 77, 0, NULL, '2026-06-29 03:57:39'),
(30, 1010, N'New Rental Request', N'You have a new rental request for gdgd.', N'rental_request', 5, 0, NULL, '2026-06-29 03:57:46'),
(31, 1006, N'Rental Request Approved', N'Your rental request for gdgd has been approved!', N'rental_request', 5, 0, NULL, '2026-06-29 03:57:53'),
(32, 1010, N'Contract Requested', N'Tenant has requested a contract for "gdgd".', N'contract', 5, 0, NULL, '2026-06-29 03:58:48'),
(33, 2, N'New Rental Request', N'You have a new rental request for tfvghfg.', N'rental_request', 6, 0, NULL, '2026-06-29 08:00:07'),
(34, 1006, N'Rental Request Rejected', N'Your rental request for tfvghfg has been rejected. Reason: hongr', N'rental_request', 6, 0, NULL, '2026-06-29 08:00:46'),
(35, 2, N'New Rental Request', N'You have a new rental request for tfvghfg.', N'rental_request', 7, 0, NULL, '2026-06-29 08:01:27'),
(36, 1006, N'Rental Request Approved', N'Your rental request for tfvghfg has been approved!', N'rental_request', 7, 0, NULL, '2026-06-29 08:01:51'),
(37, 2, N'Contract Requested', N'Tenant has requested a contract for "tfvghfg".', N'contract', 6, 0, NULL, '2026-06-29 08:02:44'),
(38, 1006, N'Contract Ready to Sign', N'The landlord has created the contract for tfvghfg. Please review, sign, and pay the deposit.', N'contract', 6, 0, NULL, '2026-06-29 08:03:44'),
(39, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "tfvghfg". Waiting for deposit payment.', N'contract', 6, 0, NULL, '2026-06-29 08:05:50'),
(40, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 6, 0, NULL, '2026-06-29 08:06:47'),
(41, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "tfvghfg". The rental is now active.', N'contract', 6, 0, NULL, '2026-06-29 08:06:48'),
(42, 1010, N'New Rental Request', N'You have a new rental request for gdgd.', N'rental_request', 8, 0, NULL, '2026-06-29 08:11:08'),
(43, 1006, N'Rental Request Approved', N'Your rental request for gdgd has been approved!', N'rental_request', 8, 0, NULL, '2026-06-29 08:11:22'),
(44, 1010, N'Contract Requested', N'Tenant has requested a contract for "gdgd".', N'contract', 7, 0, NULL, '2026-06-29 08:19:45'),
(45, 2, N'Listing Approved', N'Good news! Your listing "tfvghfg" has been approved and is now live.', N'system', 70, 0, NULL, '2026-06-29 13:16:57'),
(46, 2, N'Listing Approved', N'Good news! Your listing "tfvghfg" has been approved and is now live.', N'system', 69, 0, NULL, '2026-06-29 13:17:20');
SET IDENTITY_INSERT notifications OFF;
GO

