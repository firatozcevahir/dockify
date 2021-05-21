﻿// <auto-generated />
using System;
using Docker.Manager.Model.DataContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Dockify.Model.Migrations
{
    [DbContext(typeof(DockerDbContext))]
    [Migration("20201015111139_InitialMigration")]
    partial class InitialMigration
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.9");

            modelBuilder.Entity("Docker.Manager.Model.Entities.Company", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Address")
                        .HasColumnType("varchar(500)");

                    b.Property<string>("ContactPerson")
                        .HasColumnType("varchar(50)");

                    b.Property<Guid>("CreatedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedOn")
                        .HasColumnType("datetime");

                    b.Property<string>("DataBase")
                        .HasColumnType("TEXT");

                    b.Property<string>("DnsName")
                        .HasColumnType("varchar(200)");

                    b.Property<string>("DomainName")
                        .HasColumnType("varchar(200)");

                    b.Property<string>("EmailAddress")
                        .HasColumnType("varchar(500)");

                    b.Property<string>("Environment")
                        .HasColumnType("TEXT");

                    b.Property<string>("HostName")
                        .HasColumnType("varchar(200)");

                    b.Property<Guid?>("ModifiedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("ModifiedOn")
                        .HasColumnType("datetime");

                    b.Property<string>("Name")
                        .HasColumnType("varchar(500)");

                    b.Property<byte>("RecordState")
                        .HasColumnType("INTEGER");

                    b.Property<string>("ShortName")
                        .HasColumnType("varchar(30)");

                    b.Property<string>("TelephoneNo")
                        .HasColumnType("varchar(20)");

                    b.HasKey("Id");

                    b.ToTable("Companies");
                });

            modelBuilder.Entity("Docker.Manager.Model.Entities.CompanyDockerImage", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<Guid?>("CompanyId")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("CreatedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedOn")
                        .HasColumnType("datetime");

                    b.Property<Guid?>("DockerId")
                        .HasColumnType("TEXT");

                    b.Property<Guid?>("ModifiedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("ModifiedOn")
                        .HasColumnType("datetime");

                    b.Property<byte>("RecordState")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("CompanyId");

                    b.HasIndex("DockerId");

                    b.ToTable("CompanyDockerImages");
                });

            modelBuilder.Entity("Docker.Manager.Model.Entities.DockerAppTemplate", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<bool>("AutoUpdate")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Binds")
                        .HasColumnType("TEXT");

                    b.Property<string>("Cmd")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("CreatedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedOn")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("varchar(200)");

                    b.Property<string>("EntryPoint")
                        .HasColumnType("TEXT");

                    b.Property<string>("Env")
                        .HasColumnType("TEXT");

                    b.Property<string>("LogoURL")
                        .HasColumnType("TEXT");

                    b.Property<Guid?>("ModifiedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("ModifiedOn")
                        .HasColumnType("datetime");

                    b.Property<byte?>("Platform")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Ports")
                        .HasColumnType("TEXT");

                    b.Property<bool>("PublishAllPorts")
                        .HasColumnType("INTEGER");

                    b.Property<byte>("RecordState")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("StartContainer")
                        .HasColumnType("INTEGER");

                    b.Property<string>("TemplateTitle")
                        .IsRequired()
                        .HasColumnType("varchar(100)");

                    b.HasKey("Id");

                    b.ToTable("DockerAppTemplates");
                });

            modelBuilder.Entity("Docker.Manager.Model.Entities.DockerRegistry", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<bool>("AuthenticationRequired")
                        .HasColumnType("INTEGER");

                    b.Property<Guid>("CreatedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedOn")
                        .HasColumnType("datetime");

                    b.Property<Guid?>("ModifiedById")
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("ModifiedOn")
                        .HasColumnType("datetime");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("varchar(500)");

                    b.Property<string>("Password")
                        .HasColumnType("varchar(50)");

                    b.Property<string>("PersonalAccessToken")
                        .HasColumnType("TEXT");

                    b.Property<byte>("RecordState")
                        .HasColumnType("INTEGER");

                    b.Property<string>("RegistryUrl")
                        .IsRequired()
                        .HasColumnType("varchar(100)");

                    b.Property<string>("UserName")
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.ToTable("DockerRegistries");
                });

            modelBuilder.Entity("Docker.Manager.Model.Entities.CompanyDockerImage", b =>
                {
                    b.HasOne("Docker.Manager.Model.Entities.Company", "Companies")
                        .WithMany("CompanyDockerImages")
                        .HasForeignKey("CompanyId");

                    b.HasOne("Docker.Manager.Model.Entities.DockerAppTemplate", "DockerImages")
                        .WithMany()
                        .HasForeignKey("DockerId");
                });
#pragma warning restore 612, 618
        }
    }
}
