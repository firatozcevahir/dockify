using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Dockify.Model.Migrations
{
    public partial class InitialMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    RecordState = table.Column<byte>(nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedById = table.Column<Guid>(nullable: false),
                    ModifiedById = table.Column<Guid>(nullable: true),
                    Name = table.Column<string>(type: "varchar(500)", nullable: true),
                    ShortName = table.Column<string>(type: "varchar(30)", nullable: true),
                    DnsName = table.Column<string>(type: "varchar(200)", nullable: true),
                    DomainName = table.Column<string>(type: "varchar(200)", nullable: true),
                    DataBase = table.Column<string>(nullable: true),
                    HostName = table.Column<string>(type: "varchar(200)", nullable: true),
                    Environment = table.Column<string>(nullable: true),
                    Address = table.Column<string>(type: "varchar(500)", nullable: true),
                    TelephoneNo = table.Column<string>(type: "varchar(20)", nullable: true),
                    EmailAddress = table.Column<string>(type: "varchar(500)", nullable: true),
                    ContactPerson = table.Column<string>(type: "varchar(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DockerAppTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    RecordState = table.Column<byte>(nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedById = table.Column<Guid>(nullable: false),
                    ModifiedById = table.Column<Guid>(nullable: true),
                    TemplateTitle = table.Column<string>(type: "varchar(100)", nullable: false),
                    Description = table.Column<string>(type: "varchar(200)", nullable: false),
                    LogoURL = table.Column<string>(nullable: true),
                    PublishAllPorts = table.Column<bool>(nullable: false),
                    Ports = table.Column<string>(nullable: true),
                    Binds = table.Column<string>(nullable: true),
                    Cmd = table.Column<string>(nullable: true),
                    EntryPoint = table.Column<string>(nullable: true),
                    StartContainer = table.Column<bool>(nullable: false),
                    AutoUpdate = table.Column<bool>(nullable: false),
                    Env = table.Column<string>(nullable: true),
                    Platform = table.Column<byte>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DockerAppTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DockerRegistries",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    RecordState = table.Column<byte>(nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedById = table.Column<Guid>(nullable: false),
                    ModifiedById = table.Column<Guid>(nullable: true),
                    Name = table.Column<string>(type: "varchar(500)", nullable: false),
                    RegistryUrl = table.Column<string>(type: "varchar(100)", nullable: false),
                    AuthenticationRequired = table.Column<bool>(nullable: false),
                    UserName = table.Column<string>(type: "varchar(50)", nullable: true),
                    Password = table.Column<string>(type: "varchar(50)", nullable: true),
                    PersonalAccessToken = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DockerRegistries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompanyDockerImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    RecordState = table.Column<byte>(nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedById = table.Column<Guid>(nullable: false),
                    ModifiedById = table.Column<Guid>(nullable: true),
                    DockerId = table.Column<Guid>(nullable: true),
                    CompanyId = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyDockerImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyDockerImages_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyDockerImages_DockerAppTemplates_DockerId",
                        column: x => x.DockerId,
                        principalTable: "DockerAppTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyDockerImages_CompanyId",
                table: "CompanyDockerImages",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyDockerImages_DockerId",
                table: "CompanyDockerImages",
                column: "DockerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyDockerImages");

            migrationBuilder.DropTable(
                name: "DockerRegistries");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "DockerAppTemplates");
        }
    }
}
